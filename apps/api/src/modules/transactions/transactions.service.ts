import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { LandRecord } from '../database/entities/land-record.entity';
import { ComplianceService } from '../compliance/compliance.service';
import { TaxesService } from '../taxes/taxes.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
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

    // 1.5. Prevent multiple active transactions for the same token
    const activeTransaction = await this.transactionRepository.findOne({
      where: [
        { tokenId, status: 'Draft' },
        { tokenId, status: 'Buyer_Signed' },
        { tokenId, status: 'Seller_Signed' },
        { tokenId, status: 'Pending_Tax' }
      ]
    });
    if (activeTransaction) {
      throw new BadRequestException(`An active transaction (TX-${activeTransaction.id.toString().padStart(4, '0')}) already exists for Token ID #${tokenId}. Please complete or cancel it first.`);
    }

    // 2. Pre-check Compliance
    const compliance = await this.complianceService.preCheck(tokenId);
    if (!compliance.isSafe) {
      throw new BadRequestException({
        message: 'Pre-check failed. Transaction blocked.',
        reasons: compliance.reasons,
      });
    }

    // 3. Save Draft Transaction to DB first to prevent blockchain state mismatch if DB fails
    let savedTx;
    try {
      const transaction = this.transactionRepository.create({
        tokenId,
        buyerId,
        sellerId,
        status: 'Draft',
        contractPrice: salePrice,
      });
      savedTx = await this.transactionRepository.save(transaction);
      this.logger.log(`Created draft transaction with ID ${savedTx.id} in DB.`);
    } catch (error: any) {
      this.logger.error(`Failed to save draft transaction to DB: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create transaction record in database. ' + error.message);
    }

    // 4. Update on-chain state: DA_CAP_SO -> DANG_GIAO_DICH
    try {
      await this.blockchainService.startTransaction(tokenId);
    } catch (error: any) {
      this.logger.error(`Failed to start transaction on blockchain, deleting draft from DB. Error: ${error.message}`);
      await this.transactionRepository.delete(savedTx.id);
      throw new InternalServerErrorException('Failed to start transaction on blockchain. ' + error.message);
    }

    return savedTx;
  }

  async sign(transactionId: number, userId: number) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== 'Draft' && transaction.status !== 'Seller_Signed' && transaction.status !== 'Buyer_Signed') {
      throw new BadRequestException('Can only sign draft or partially signed transactions');
    }

    let isFullySigned = false;

    if (userId === transaction.sellerId) {
      if (transaction.status === 'Buyer_Signed') {
        isFullySigned = true;
      } else if (transaction.status === 'Draft') {
        transaction.status = 'Seller_Signed';
      } else {
        throw new BadRequestException('Seller has already signed');
      }
    } else if (userId === transaction.buyerId) {
      if (transaction.status === 'Seller_Signed') {
        isFullySigned = true;
      } else if (transaction.status === 'Draft') {
        transaction.status = 'Buyer_Signed';
      } else {
        throw new BadRequestException('Buyer has already signed');
      }
    } else {
      throw new BadRequestException('User is not a party to this transaction');
    }

    // If both signed, move to Pending_Tax and calculate taxes
    if (isFullySigned) {
      transaction.status = 'Pending_Tax';
      
      try {
        // Calculate and save taxes
        await this.taxesService.calculateAndSaveTransferTaxes(transaction.id);
        // Ownership transfer will happen in taxes.service.ts when all taxes are paid
      } catch (e: any) {
        throw new BadRequestException("Sign process failed: " + e.message);
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
    
    try {
      // Task A3: Sync state machine: DANG_GIAO_DICH -> DA_CAP_SO
      await this.blockchainService.cancelTransaction(transaction.tokenId);
    } catch (error: any) {
      console.warn(`[TransactionsService] Blockchain cancelTransaction failed for token ${transaction.tokenId}, proceeding to cancel in DB anyway:`, error.message);
    }
    
    return this.transactionRepository.save(transaction);
  }

  async getOne(transactionId: number) {
    const transaction = await this.transactionRepository.findOne({ 
      where: { id: transactionId },
      relations: ['buyer', 'seller']
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async findAll(userId: number) {
    return this.transactionRepository.find({
      where: [
        { buyerId: userId },
        { sellerId: userId }
      ],
      relations: ['buyer', 'seller'],
      order: { createdAt: 'DESC' }
    });
  }
}
