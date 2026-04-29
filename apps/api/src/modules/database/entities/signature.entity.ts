import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ApprovalRequest } from './approval-request.entity';
import { User } from './user.entity';

@Entity('signatures')
export class Signature {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ApprovalRequest)
  @JoinColumn({ name: 'request_id' })
  request: ApprovalRequest;

  @Column({ name: 'request_id' })
  requestId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  decision: string; // Approved, Rejected

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ name: 'sign_tx_hash', length: 255, nullable: true })
  signTxHash: string;

  @CreateDateColumn({ name: 'signed_at' })
  signedAt: Date;
}
