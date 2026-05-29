import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxFee } from '../database/entities/tax-fee.entity';
import { Receipt } from '../database/entities/receipt.entity';
import { LandRecord } from '../database/entities/land-record.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { SystemConfig } from '../database/entities/system-config.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { LandNFT } from '../database/entities/land-nft.entity';
import { Wallet } from '../database/entities/wallet.entity';
import { IPFS_CLIENT } from '../ipfs/ipfs.constants';
import { IpfsClient } from '../ipfs/ipfs.types';
import { Inject } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class TaxesService {
  private readonly logger = new Logger(TaxesService.name);

  constructor(
    @InjectRepository(TaxFee)
    private readonly taxFeeRepository: Repository<TaxFee>,
    @InjectRepository(Receipt)
    private readonly receiptRepository: Repository<Receipt>,
    @InjectRepository(LandRecord)
    private readonly landRecordRepository: Repository<LandRecord>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
    @InjectRepository(LandNFT)
    private readonly landNftRepository: Repository<LandNFT>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly blockchainService: BlockchainService,
    @Inject(IPFS_CLIENT) private readonly ipfsClient: IpfsClient,
  ) {}

  /**
   * Tính thuế thu nhập cá nhân (TNCN) - 2%
   */
  calculateTNCN(amount: number): number {
    return amount * 0.02;
  }

  /**
   * Tính lệ phí trước bạ - 0.5%
   */
  calculateRegistrationFee(amount: number): number {
    return amount * 0.005;
  }

  /**
   * Tính phí công chứng theo bậc thang
   */
  calculateNotaryFee(value: number): number {
    if (value <= 100000000) return 100000; // Dưới 100 triệu: 100k
    if (value <= 1000000000) return value * 0.001; // Từ 100 triệu đến 1 tỷ: 0.1%
    if (value <= 3000000000) return 1000000 + (value - 1000000000) * 0.0006; // 1 tỷ - 3 tỷ: 1 triệu + 0.06% phần vượt
    if (value <= 5000000000) return 2200000 + (value - 3000000000) * 0.0005; // 3 tỷ - 5 tỷ: 2.2 triệu + 0.05% phần vượt
    if (value <= 10000000000) return 3200000 + (value - 5000000000) * 0.0004; // 5 tỷ - 10 tỷ: 3.2 triệu + 0.04% phần vượt
    return 5200000 + (value - 10000000000) * 0.0003; // Trên 10 tỷ: 5.2 triệu + 0.03% phần vượt (tối đa thường là 70tr - 100tr tùy luật)
  }

  /**
   * Tính thuế sử dụng đất phi nông nghiệp hàng năm
   * Diện tích trong hạn mức: 0,03%
   * Diện tích vượt không quá 3 lần hạn mức: 0,07%
   * Diện tích vượt trên 3 lần hạn mức: 0,15%
   */
  calculateAnnualLandTax(area: number, pricePerM2: number, limit: number): number {
    const totalValue = area * pricePerM2;
    if (area <= limit) {
      return totalValue * 0.0003;
    }
    
    let tax = (limit * pricePerM2) * 0.0003;
    const remainingArea = area - limit;
    
    if (remainingArea <= limit * 2) {
      tax += (remainingArea * pricePerM2) * 0.0007;
    } else {
      tax += (limit * 2 * pricePerM2) * 0.0007;
      tax += ((remainingArea - limit * 2) * pricePerM2) * 0.0015;
    }
    
    return tax;
  }

  async calculateAndSaveTransferTaxes(transactionId: number) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    if (!transaction) throw new NotFoundException('Transaction not found');

    const amount = transaction.contractPrice;

    const tncn = this.calculateTNCN(amount);
    const registrationFee = this.calculateRegistrationFee(amount);
    const notaryFee = this.calculateNotaryFee(amount);

    const taxes = [
      { type: 'TNCN', amount: tncn },
      { type: 'Registration_Fee', amount: registrationFee },
      { type: 'Notary_Fee', amount: notaryFee },
    ];

    const savedTaxes = [];
    for (const t of taxes) {
      const taxFee = this.taxFeeRepository.create({
        transactionId,
        taxType: t.type,
        amount: t.amount,
        status: 'Unpaid',
      });
      savedTaxes.push(await this.taxFeeRepository.save(taxFee));
    }

    return savedTaxes;
  }

  async payTax(taxId: number, payerId: number) {
    try {
      const tax = await this.taxFeeRepository.findOne({ where: { id: taxId } });
      if (!tax) throw new NotFoundException('Tax record not found');
      if (tax.status === 'Paid') throw new BadRequestException('Tax already paid');

      tax.status = 'Paid';
      await this.taxFeeRepository.save(tax);

      // Create Receipt
    const receipt = this.receiptRepository.create({
      taxId: tax.id,
      amount: tax.amount,
      payerId,
      paymentMethod: 'VNeID_Wallet', // Default simulation
      status: 'Success',
    });

    const savedReceipt = await this.receiptRepository.save(receipt);

    // IPFS and Blockchain logic for the receipt
    try {
      const receiptJson = {
        receiptId: savedReceipt.id,
        taxType: tax.taxType,
        amount: Number(tax.amount),
        payerId,
        paymentMethod: 'VNeID_Wallet',
        transactionId: tax.transactionId,
        paidAt: savedReceipt.paidAt || new Date().toISOString(),
      };

      const ipfsResult = await this.ipfsClient.uploadJson({
        json: receiptJson,
        name: `receipt-${savedReceipt.id}`,
      });
      savedReceipt.receiptCid = ipfsResult.cid;
      
      const fakePayerAddress = '0x0000000000000000000000000000000000000000';
      const receiptTxHashBytes32 = ethers.id(`receipt-${savedReceipt.id}-${Date.now()}`);
      
      const onChainTxHash = await this.blockchainService.recordReceipt(
        receiptTxHashBytes32, 
        fakePayerAddress, 
        0, // we log amount in the JSON, keep 0 here or pass actual value
        ipfsResult.cid
      );
      
      savedReceipt.blockchainTxHash = onChainTxHash;
      await this.receiptRepository.save(savedReceipt);
      this.logger.log(`Receipt ${savedReceipt.id} uploaded to IPFS and recorded on-chain`);
    } catch (err) {
      this.logger.error(`Failed to record receipt to IPFS/Blockchain:`, err);
    }

    // Update on-chain EContract tax status if initialized
    try {
      const transaction = await this.transactionRepository.findOne({ where: { id: tax.transactionId } });
      if (transaction && this.blockchainService.eContractContract) {
        // Query active contract ID for this token
        const activeContractId = await this.blockchainService.eContractContract.activeContractByToken(transaction.tokenId);
        if (activeContractId > 0n) {
          this.logger.log(`Invoking payTax on-chain for EContract ID: ${activeContractId}`);
          const tx = await this.blockchainService.eContractContract.payTax(activeContractId);
          await tx.wait();
          savedReceipt.blockchainTxHash = tx.hash;
          await this.receiptRepository.save(savedReceipt);
          this.logger.log(`Successfully updated tax payment status on-chain. TxHash: ${tx.hash}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update tax paid status on-chain:`, error);
    }

    // Check if all taxes for the transaction are paid, and if so, transition transaction to Completed
    const allTaxes = await this.taxFeeRepository.find({ where: { transactionId: tax.transactionId } });
    const allPaid = allTaxes.every(t => t.status === 'Paid');
    if (allPaid) {
      const transaction = await this.transactionRepository.findOne({ where: { id: tax.transactionId } });
      if (transaction && transaction.status !== 'Completed') {
        // Update NFT owner on blockchain
        // Task A3: Sync state machine: DANG_GIAO_DICH -> CHUYEN_NHUONG
        await this.blockchainService.completeTransfer(transaction.tokenId);

        const buyerWallet = await this.walletRepository.findOne({ where: { userId: transaction.buyerId } });
        const sellerWallet = await this.walletRepository.findOne({ where: { userId: transaction.sellerId } });
        if (buyerWallet && sellerWallet) {
          // The blockchain completeTransfer already handles the actual NFT transfer internally via escrow.
          // We only need to update the off-chain database records.
          await this.landNftRepository.update({ tokenId: transaction.tokenId }, { ownerWallet: buyerWallet.walletAddress });
          const nft = await this.landNftRepository.findOne({ where: { tokenId: transaction.tokenId } });
          if (nft) {
            await this.landRecordRepository.update({ id: nft.recordId }, { ownerId: transaction.buyerId });
          }
        }
        
        transaction.status = 'Completed';
        transaction.completedAt = new Date();
        await this.transactionRepository.save(transaction);
        this.logger.log(`Transaction ${transaction.id} is fully paid and transitioned to Completed`);
      }
    }

    return savedReceipt;
    } catch (error) {
      console.error('PAY TAX ERROR:', error);
      throw error;
    }
  }

  async getMyReceipts(userId: number) {
    return this.receiptRepository.find({
      where: { payerId: userId },
      relations: ['tax', 'tax.transaction', 'tax.transaction.nft'],
      order: { paidAt: 'DESC' },
    });
  }

  async getTaxesByTransaction(transactionId: number) {
    return this.taxFeeRepository.find({
      where: { transactionId },
      order: { id: 'ASC' },
    });
  }

  async verifyReceipt(receiptId: number) {
    const receipt = await this.receiptRepository.findOne({ 
      where: { id: receiptId },
      relations: ['tax']
    });
    
    if (!receipt) throw new NotFoundException('Receipt not found');
    if (!receipt.blockchainTxHash || !receipt.receiptCid) {
      throw new BadRequestException('Receipt does not have on-chain proofs yet');
    }
    
    return {
      receipt,
      isVerified: true,
      ipfsUrl: `https://plum-just-mule-663.mypinata.cloud/ipfs/${receipt.receiptCid}`,
      etherscanUrl: `https://sepolia.etherscan.io/tx/${receipt.blockchainTxHash}`
    };
  }
}
