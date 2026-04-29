import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Transaction } from './transaction.entity';

@Entity('taxes_fees')
export class TaxFee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @Column({ name: 'tax_type', length: 100 })
  taxType: string; // TNCN (2%), Lệ phí trước bạ

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({ length: 50, default: 'Unpaid' })
  status: string; // Unpaid, Paid

  @CreateDateColumn({ name: 'calculated_at' })
  calculatedAt: Date;
}
