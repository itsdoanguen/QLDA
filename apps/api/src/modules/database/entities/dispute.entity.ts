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

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandNFT)
  @JoinColumn({ name: 'token_id' })
  nft: LandNFT;

  @Column({ name: 'token_id' })
  tokenId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'claimant_id' })
  claimant: User;

  @Column({ name: 'claimant_id' })
  claimantId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50, default: 'Pending' })
  status: string; // Pending, Resolving, Resolved

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;
}
