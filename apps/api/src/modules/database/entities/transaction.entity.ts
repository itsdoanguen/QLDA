import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LandNFT } from './land-nft.entity';
import { User } from './user.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandNFT)
  @JoinColumn({ name: 'token_id' })
  nft: LandNFT;

  @Column({ name: 'token_id' })
  tokenId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'certifier_id' })
  certifier: User;

  @Column({ name: 'certifier_id', nullable: true })
  certifierId: number;

  @Column({ name: 'contract_price', type: 'decimal', precision: 20, scale: 2 })
  contractPrice: number;

  @Column({ length: 50, default: 'Draft' })
  status: string; // Pre-check, Draft, Signed, Completed, Cancelled

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;
}
