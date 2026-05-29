import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, randomBytes } from 'crypto';
import { ethers } from 'ethers';

import { Wallet } from '../database/entities/wallet.entity';
import { WalletSecret } from '../database/entities/wallet-secret.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { User } from '../database/entities/user.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletSecret)
    private walletSecretRepository: Repository<WalletSecret>,
    @InjectRepository(WalletRecoveryRequest)
    private recoveryRepository: Repository<WalletRecoveryRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LandNFT)
    private landNftRepository: Repository<LandNFT>,
    private readonly blockchainService: BlockchainService,
  ) {}

  private getMasterKey(): Buffer {
    const rawKey = process.env.MASTER_ENCRYPTION_KEY?.trim();
    if (!rawKey) {
      throw new Error('MASTER_ENCRYPTION_KEY is required');
    }

    const key = Buffer.from(rawKey, 'base64');
    if (key.length !== 32) {
      throw new Error('MASTER_ENCRYPTION_KEY must be 32 bytes in base64 format');
    }

    return key;
  }

  private encryptPrivateKey(privateKey: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getMasterKey(), iv);
    const encrypted = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()]);

    return {
      encryptedPrivateKey: encrypted.toString('base64'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  /**
   * Compute the citizen ID hash (SHA-256 of CCCD number) used as on-chain identifier.
   */
  private computeCitizenIdHash(vneidNumber: string): string {
    return ethers.sha256(ethers.toUtf8Bytes(vneidNumber));
  }

  async linkWallet(userId: number, payload: WalletLinkRequest) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingByUser = await this.walletRepository.findOne({ where: { userId, status: 'Active' } });
    if (existingByUser) {
      throw new BadRequestException(`CCCD ${user.vneidNumber} is already linked to a wallet`);
    }

    const existingByAddress = await this.walletRepository.findOne({ where: { walletAddress: payload.walletAddress } });
    if (existingByAddress) {
      throw new BadRequestException('Wallet address is already linked to another CCCD');
    }

    let wallet = this.walletRepository.create({
      walletAddress: payload.walletAddress,
      userId: userId,
      status: 'Active',
    });
    wallet = await this.walletRepository.save(wallet);

    // Register the citizen-wallet mapping on-chain (WalletOverride contract)
    try {
      const citizenIdHash = this.computeCitizenIdHash(user.vneidNumber);
      if (this.blockchainService.walletOverrideContract) {
        await this.blockchainService.walletOverrideContract.registerCitizenWallet(
          citizenIdHash,
          payload.walletAddress,
        );
        this.logger.log(`Registered citizen-wallet mapping on-chain for user ${userId}`);
      }
    } catch (error: any) {
      // Log but don't fail — the on-chain registration is best-effort during link.
      // It may already be registered or the contract may not be deployed.
      this.logger.warn(`Failed to register citizen-wallet on-chain for user ${userId}: ${error.message}`);
    }

    return { message: 'Wallet linked successfully' };
  }

  async ensureManagedWallet(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let existingWallet = await this.walletRepository.findOne({ where: { userId, status: 'Active' } });
    if (existingWallet) {
      return existingWallet;
    }

    // Auto-provision a managed wallet for the user
    const newWallet = ethers.Wallet.createRandom();

    const encryptedSecret = this.encryptPrivateKey(newWallet.privateKey);

    return this.walletRepository.manager.transaction(async (manager) => {
      const walletRepo = manager.getRepository(Wallet);
      const walletSecretRepo = manager.getRepository(WalletSecret);

      const wallet = walletRepo.create({
        walletAddress: newWallet.address,
        userId,
        status: 'Active',
      });
      const savedWallet = await walletRepo.save(wallet);

      const walletSecret = walletSecretRepo.create({
        walletAddress: savedWallet.walletAddress,
        encryptedPrivateKey: encryptedSecret.encryptedPrivateKey,
        iv: encryptedSecret.iv,
        authTag: encryptedSecret.authTag,
      });

      await walletSecretRepo.save(walletSecret);

      // Register on-chain citizen-wallet mapping
      try {
        const citizenIdHash = this.computeCitizenIdHash(user.vneidNumber);
        if (this.blockchainService.walletOverrideContract) {
          await this.blockchainService.walletOverrideContract.registerCitizenWallet(
            citizenIdHash,
            newWallet.address,
          );
          this.logger.log(`Registered managed wallet on-chain for user ${userId}`);
        }
      } catch (error: any) {
        this.logger.warn(`Failed to register managed wallet on-chain for user ${userId}: ${error.message}`);
      }

      return savedWallet;
    });
  }

  async requestRecovery(userId: number, payload: WalletRecoveryRequestDto) {
    const existingWallet = await this.walletRepository.findOne({ where: { userId, status: 'Active' } });
    if (!existingWallet) {
      throw new BadRequestException('User does not have an active wallet to recover');
    }

    if (existingWallet.walletAddress !== payload.oldWalletAddress) {
      throw new BadRequestException('Old wallet address does not match current active wallet');
    }

    const existingRequest = await this.recoveryRepository.findOne({ where: { userId, status: 'Pending' } });
    if (existingRequest) {
      throw new BadRequestException('User already has a pending recovery request');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let targetWalletAddress = payload.newWalletAddress;
    
    // Nếu công dân không tự cung cấp ví đích (Non-custodial), hệ thống tự sinh ví Managed Wallet mới
    if (!targetWalletAddress) {
      const newWallet = ethers.Wallet.createRandom();
      targetWalletAddress = newWallet.address;
      const encryptedSecret = this.encryptPrivateKey(newWallet.privateKey);

      // Create Wallet record first with status 'Locked' to satisfy FK constraint
      const walletRecord = this.walletRepository.create({
        walletAddress: targetWalletAddress,
        userId: userId,
        status: 'Locked',
      });
      await this.walletRepository.save(walletRecord);

      // Lưu WalletSecret tạm thời cho ví mới này.
      // Dù ví chưa kích hoạt (chưa nằm trong bảng wallets) nhưng đã có secret sẵn sàng.
      const walletSecret = this.walletSecretRepository.create({
        walletAddress: targetWalletAddress,
        encryptedPrivateKey: encryptedSecret.encryptedPrivateKey,
        iv: encryptedSecret.iv,
        authTag: encryptedSecret.authTag,
      });
      await this.walletSecretRepository.save(walletSecret);
      this.logger.log(`Auto-generated new managed wallet ${targetWalletAddress} for recovery request of user ${userId}`);
    }

    const citizenIdHash = this.computeCitizenIdHash(user.vneidNumber);
    
    // Call WalletOverride.requestWalletOverride() on-chain
    const chainRequestId = await this.blockchainService.requestWalletOverride(citizenIdHash, targetWalletAddress);
    this.logger.log(`Created on-chain recovery request #${chainRequestId} for user ${userId}`);

    const request = this.recoveryRepository.create({
      userId,
      oldWalletAddress: payload.oldWalletAddress,
      newWalletAddress: targetWalletAddress,
      status: 'Pending',
      chainRequestId,
    });

    await this.recoveryRepository.save(request);
    
    return { message: 'Recovery request submitted successfully', requestId: request.id, chainRequestId, targetWalletAddress };
  }

  async approveRecovery(requestId: number, adminUserId: number) {
    const request = await this.recoveryRepository.findOne({
      where: { id: requestId },
      relations: ['user'],
    });
    if (!request || request.status !== 'Pending') {
      throw new BadRequestException('Request not found or not pending');
    }

    // Find all NFTs owned by the old wallet (for bulk transfer)
    const nfts = await this.landNftRepository.find({ where: { ownerWallet: request.oldWalletAddress } });
    const tokenIds = nfts.map(nft => nft.tokenId);

    // Call WalletOverride.approveWalletOverride() on-chain — updates mapping + emits event
    await this.blockchainService.approveWalletOverride(request.chainRequestId, tokenIds);
    this.logger.log(`Approved on-chain recovery request #${request.chainRequestId}`);

    // Transfer NFTs on-chain via LandRegistry.proxyAdminTransfer (Backend is Owner of LandRegistry)
    const transferredOnChain: string[] = [];
    for (const tid of tokenIds) {
      try {
        await this.blockchainService.transferNFT(request.oldWalletAddress, request.newWalletAddress, tid);
        transferredOnChain.push(tid);
        this.logger.log(`Transferred NFT ${tid} from ${request.oldWalletAddress} to ${request.newWalletAddress} on-chain`);
      } catch (err: any) {
        this.logger.error(`Failed to transfer NFT ${tid} on-chain during recovery: ${err.message}`);
      }
    }
    this.logger.log(`Transferred ${transferredOnChain.length}/${tokenIds.length} NFTs successfully on-chain.`);

    // Update local DB — recovery request
    request.status = 'Approved';
    request.approvedBy = adminUserId;
    request.resolvedAt = new Date();
    await this.recoveryRepository.save(request);

    // Update old wallet status to 'Replaced' (per DB schema: Active, Locked, Replaced)
    const oldWallet = await this.walletRepository.findOne({ where: { walletAddress: request.oldWalletAddress } });
    await this.walletRepository.update({ walletAddress: request.oldWalletAddress }, { status: 'Replaced' });
      
    const newWalletExists = await this.walletRepository.findOne({ where: { walletAddress: request.newWalletAddress } });
    if (newWalletExists) {
      await this.walletRepository.update({ walletAddress: request.newWalletAddress }, { status: 'Active' });
    } else {
      const newWallet = this.walletRepository.create({
        walletAddress: request.newWalletAddress,
        userId: request.userId,
        status: 'Active',
      });
      await this.walletRepository.save(newWallet);
    }

    // Update NFTs local owner to the new wallet address
    for (const nft of nfts) {
      nft.ownerWallet = request.newWalletAddress;
      await this.landNftRepository.save(nft);
    }

    return {
      message: 'Recovery approved and executed',
      transferredTokenIds: tokenIds,
      newWalletAddress: request.newWalletAddress,
    };
  }

  async rejectRecovery(requestId: number, adminUserId: number, reason: string) {
    const request = await this.recoveryRepository.findOne({ where: { id: requestId } });
    if (!request || request.status !== 'Pending') {
      throw new BadRequestException('Request not found or not pending');
    }

    // Call WalletOverride.rejectWalletOverride() on-chain
    await this.blockchainService.rejectWalletOverride(request.chainRequestId, reason);
    this.logger.log(`Rejected on-chain recovery request #${request.chainRequestId}: ${reason}`);

    request.status = 'Rejected';
    request.approvedBy = adminUserId;
    request.resolvedAt = new Date();
    await this.recoveryRepository.save(request);

    return { message: 'Recovery rejected', reason };
  }

  // --- Admin/Lãnh đạo: list & detail for recovery management ---

  async listRecoveryRequests(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const requests = await this.recoveryRepository.find({
      where,
      relations: ['user', 'approver'],
      order: { createdAt: 'DESC' },
    });

    return requests.map(r => ({
      id: r.id,
      userId: r.userId,
      userFullName: r.user?.fullName,
      userVneidNumber: r.user?.vneidNumber,
      oldWalletAddress: r.oldWalletAddress,
      newWalletAddress: r.newWalletAddress,
      status: r.status,
      chainRequestId: r.chainRequestId,
      approverFullName: r.approver?.fullName,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt,
    }));
  }

  async getRecoveryRequestDetail(requestId: number) {
    const request = await this.recoveryRepository.findOne({
      where: { id: requestId },
      relations: ['user', 'approver'],
    });

    if (!request) {
      throw new NotFoundException('Recovery request not found');
    }

    // Find NFTs currently held by the old wallet (shows what will be transferred)
    const affectedNfts = await this.landNftRepository.find({
      where: { ownerWallet: request.oldWalletAddress },
    });

    return {
      id: request.id,
      userId: request.userId,
      userFullName: request.user?.fullName,
      userVneidNumber: request.user?.vneidNumber,
      oldWalletAddress: request.oldWalletAddress,
      newWalletAddress: request.newWalletAddress,
      status: request.status,
      chainRequestId: request.chainRequestId,
      approverFullName: request.approver?.fullName,
      createdAt: request.createdAt,
      resolvedAt: request.resolvedAt,
      affectedTokenIds: affectedNfts.map(nft => nft.tokenId),
    };
  }

  // --- User endpoints ---

  async getStatus(userId: number) {
    this.logger.log(`[getStatus] Fetching wallet status for userId=${userId}`);

    const wallet = await this.walletRepository.findOne({ where: { userId, status: 'Active' } });
    const recoveryRequests = await this.recoveryRepository.find({ where: { userId } });

    this.logger.log(`[getStatus] userId=${userId} wallet=${wallet?.walletAddress ?? 'none'}, recoveryRequests=${recoveryRequests.length}`);

    // Xác định ví có phải ví managed (có private key lưu trong hệ thống) hay không
    let isManaged = false;
    if (wallet) {
      try {
        const secret = await this.walletSecretRepository.findOne({
          where: { walletAddress: wallet.walletAddress },
        });
        isManaged = !!secret;
        this.logger.log(`[getStatus] wallet isManaged=${isManaged} for userId=${userId}`);
      } catch (e: any) {
        this.logger.warn(`[getStatus] Failed to check wallet secret for userId=${userId}: ${e.message}`);
      }
    }

    return {
      activeWallet: wallet ? {
        walletAddress: wallet.walletAddress,
        status: wallet.status,
        isManaged,
        linkedAt: wallet.createdAt,
      } : null,
      recoveryRequests: recoveryRequests.map(r => ({
        requestId: r.id,
        status: r.status,
        createdAt: r.createdAt,
      }))
    };
  }

  async getWalletDetails(userId: number) {
    this.logger.log(`[getWalletDetails] Fetching wallet details for userId=${userId}`);

    const wallet = await this.walletRepository.findOne({ where: { userId, status: 'Active' } });
    if (!wallet) {
      // Trả về null thay vì ném NotFoundException để FE xử lý mềm mại hơn
      this.logger.warn(`[getWalletDetails] No wallet found for userId=${userId}, returning null`);
      return null;
    }

    this.logger.log(`[getWalletDetails] Found wallet=${wallet.walletAddress} for userId=${userId}`);

    let balanceWEI = 0n;
    let txCount = 0;
    let isContract = false;

    try {
      const provider = (this.blockchainService as any).provider || (this.blockchainService as any).signer?.provider;
      if (provider) {
        this.logger.log(`[getWalletDetails] Querying on-chain data for wallet=${wallet.walletAddress}`);
        balanceWEI = await provider.getBalance(wallet.walletAddress);
        txCount = await provider.getTransactionCount(wallet.walletAddress);
        const code = await provider.getCode(wallet.walletAddress);
        isContract = code !== '0x';
        this.logger.log(`[getWalletDetails] On-chain data: balanceWEI=${balanceWEI}, txCount=${txCount}, isContract=${isContract}`);
      } else {
        this.logger.warn(`[getWalletDetails] No blockchain provider available, returning default on-chain values`);
      }
    } catch (e: any) {
      this.logger.warn(`[getWalletDetails] Failed to fetch on-chain details for wallet ${wallet.walletAddress}: ${e.message}`);
      this.logger.debug(`[getWalletDetails] Stack: ${e.stack}`);
    }

    return {
      walletAddress: wallet.walletAddress,
      balanceETH: ethers.formatEther(balanceWEI),
      balanceWEI: balanceWEI.toString(),
      txCount,
      isContract,
    };
  }
}
