import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LandNFT } from './land-nft.entity';

@Entity('mortgages')
export class Mortgage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandNFT)
  @JoinColumn({ name: 'token_id' })
  nft: LandNFT;

  @Column({ name: 'token_id' })
  tokenId: string;

  @Column({ name: 'bank_name', length: 255 })
  bankName: string;

  @Column({ name: 'mortgage_amount', type: 'decimal', precision: 20, scale: 2 })
  mortgageAmount: number;

  @Column({ length: 50, default: 'Active' })
  status: string; // Active, Released

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date;
}
