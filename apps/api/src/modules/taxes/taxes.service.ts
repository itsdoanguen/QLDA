import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxFee } from '../database/entities/tax-fee.entity';
import { Receipt } from '../database/entities/receipt.entity';
import { LandRecord } from '../database/entities/land-record.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { SystemConfig } from '../database/entities/system-config.entity';

@Injectable()
export class TaxesService {
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

    return this.receiptRepository.save(receipt);
  }
}
