import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';

import { Wallet } from '../database/entities/wallet.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { User } from '../database/entities/user.entity';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletRecoveryRequest)
    private recoveryRepository: Repository<WalletRecoveryRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
    // Note: In Phase 1, we generate a new keypair and will store it securely.
    // For now, we simulate wallet generation.
    const newWallet = ethers.Wallet.createRandom();
    
    let wallet = this.walletRepository.create({
      walletAddress: newWallet.address,
      userId: userId,
      status: 'Active',
    });
    wallet = await this.walletRepository.save(wallet);

    return wallet;
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
}
