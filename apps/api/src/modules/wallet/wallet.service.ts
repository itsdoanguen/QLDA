import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wallet } from '../database/entities/wallet.entity';
import { WalletRecoveryRequest } from '../database/entities/wallet-recovery-request.entity';
import { WalletLinkRequest, WalletRecoveryRequestDto } from '@land-registry/shared-types';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(WalletRecoveryRequest)
    private recoveryRepository: Repository<WalletRecoveryRequest>,
  ) {}

  async linkWallet(userId: number, payload: WalletLinkRequest) {
    const existingByUser = await this.walletRepository.findOne({ where: { userId } });
    if (existingByUser) {
      throw new BadRequestException('User already has a linked wallet');
    }

    const existingByAddress = await this.walletRepository.findOne({ where: { walletAddress: payload.walletAddress } });
    if (existingByAddress) {
      throw new BadRequestException('Wallet address is already linked to another user');
    }

    let wallet = this.walletRepository.create({
      walletAddress: payload.walletAddress,
      userId: userId,
      status: 'Active',
    });
    wallet = await this.walletRepository.save(wallet);

    return { message: 'Wallet linked successfully' };
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
