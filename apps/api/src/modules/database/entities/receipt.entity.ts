import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TaxFee } from './tax-fee.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => TaxFee)
  @JoinColumn({ name: 'tax_id' })
  tax: TaxFee;

  @Column({ name: 'tax_id' })
  taxId: number;

  @Column({ name: 'payment_method', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ name: 'blockchain_tx_hash', length: 255, nullable: true })
  blockchainTxHash: string;

  @CreateDateColumn({ name: 'paid_at' })
  paidAt: Date;
}
