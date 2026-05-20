import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('wallet_recovery_requests')
export class WalletRecoveryRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'old_wallet_address', length: 128 })
  oldWalletAddress: string;

  @Column({ name: 'new_wallet_address', length: 128 })
  newWalletAddress: string;

  @Column({ length: 20, default: 'Pending' })
  status: string; // Pending, Approved, Rejected

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'chain_request_id', nullable: true })
  chainRequestId: number;
}
