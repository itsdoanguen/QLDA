import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, randomBytes } from 'crypto';
import { ethers } from 'ethers';

import { Wallet } from '../database/entities/wallet.entity';
import { WalletSecret } from '../database/entities/wallet-secret.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { User } from '../database/entities/user.entity';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletSecret)
    private walletSecretRepository: Repository<WalletSecret>,
    @InjectRepository(WalletRecoveryRequest)
    private recoveryRepository: Repository<WalletRecoveryRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async linkWallet(userId: number, payload: WalletLinkRequest) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingByUser = await this.walletRepository.findOne({ where: { userId } });
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

    return { message: 'Wallet linked successfully' };
  }

  async ensureManagedWallet(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let existingWallet = await this.walletRepository.findOne({ where: { userId } });
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

    const request = this.recoveryRepository.create({
      userId,
      oldWalletAddress: payload.oldWalletAddress,
      newWalletAddress: payload.newWalletAddress,
      status: 'Pending',
    });

    await this.recoveryRepository.save(request);
    
    return { message: 'Recovery request submitted successfully' };
  }

  async getStatus(userId: number) {
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    const recoveryRequests = await this.recoveryRepository.find({ where: { userId } });

    return {
      activeWallet: wallet ? {
        walletAddress: wallet.walletAddress,
        status: wallet.status,
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
    const wallet = await this.walletRepository.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      walletAddress: wallet.walletAddress,
      status: wallet.status,
      linkedAt: wallet.createdAt,
    };
  }
}
