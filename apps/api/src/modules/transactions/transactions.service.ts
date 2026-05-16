import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { ComplianceService } from '../compliance/compliance.service';
import { TaxesService } from '../taxes/taxes.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly complianceService: ComplianceService,
    private readonly taxesService: TaxesService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createDraft(tokenId: string, buyerId: number, sellerId: number, salePrice: number) {
    // 1. Verify NFT exists and is Normal
    const nft = await this.landNftRepository.findOne({ where: { tokenId } });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }
    if (nft.status !== 'Normal') {
      throw new BadRequestException(`Cannot transfer NFT with status: ${nft.status}`);
    }

    // 2. Pre-check Compliance
    const compliance = await this.complianceService.preCheck(tokenId);
    if (!compliance.isSafe) {
      throw new BadRequestException({
        message: 'Pre-check failed. Transaction blocked.',
        reasons: compliance.reasons,
      });
    }

    // 3. Create Draft Transaction
    const transaction = this.transactionRepository.create({
      tokenId,
      buyerId,
      sellerId,
      status: 'Draft',
      salePrice,
    });

    // 4. Update on-chain state: DA_CAP_SO -> DANG_GIAO_DICH
    await this.blockchainService.startTransaction(tokenId);

    return this.transactionRepository.save(transaction);
  }

  async sign(transactionId: number, userId: number) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'Draft') {
      throw new BadRequestException('Can only sign draft transactions');
    }

    if (userId === transaction.sellerId) {
      transaction.sellerSigned = true;
      transaction.sellerSignedAt = new Date();
    } else if (userId === transaction.buyerId) {
      transaction.buyerSigned = true;
      transaction.buyerSignedAt = new Date();
    } else {
      throw new BadRequestException('User is not a party to this transaction');
    }

    // If both signed, move to Pending_Tax and calculate taxes
    if (transaction.sellerSigned && transaction.buyerSigned) {
      transaction.status = 'Pending_Tax';
      
      // Calculate and save taxes
      await this.taxesService.calculateAndSaveTransferTaxes(transaction.id);

      // Update NFT owner (Simulating blockchain transfer locally for now)
      // Task A3: Sync state machine: DANG_GIAO_DICH -> CHUYEN_NHUONG
      await this.blockchainService.completeTransfer(transaction.tokenId);

      const buyerWallet = await this.walletRepository.findOne({ where: { userId: transaction.buyerId } });
      if (buyerWallet) {
        await this.landNftRepository.update({ tokenId: transaction.tokenId }, { ownerWallet: buyerWallet.walletAddress });
      }
    }

    return this.transactionRepository.save(transaction);
  }

  async cancel(transactionId: number, userId: number) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'Completed' || transaction.status === 'Cancelled') {
      throw new BadRequestException('Cannot cancel completed or already cancelled transactions');
    }

    if (userId !== transaction.sellerId && userId !== transaction.buyerId) {
      throw new BadRequestException('User is not a party to this transaction');
    }

    transaction.status = 'Cancelled';
    
    // Task A3: Sync state machine: DANG_GIAO_DICH -> DA_CAP_SO
    await this.blockchainService.cancelTransaction(transaction.tokenId);
    
    return this.transactionRepository.save(transaction);
  }

  async getOne(transactionId: number) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }
}
