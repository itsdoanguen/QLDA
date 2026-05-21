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

@Entity('fraud_reports')
export class FraudReport {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reporter_id' })
  reporterId: number;

  @ManyToOne(() => LandNFT)
  @JoinColumn({ name: 'token_id' })
  nft: LandNFT;

  @Column({ name: 'token_id' })
  tokenId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'evidence_images', type: 'text', nullable: true })
  evidenceImages: string; // Link ảnh bằng chứng (JSON/Comma separated)

  @Column({ length: 50, default: 'Pending' })
  status: string; // Pending, Verified, Rejected

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: number;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
