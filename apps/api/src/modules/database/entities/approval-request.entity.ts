import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LandRecord } from './land-record.entity';

@Entity('approval_requests')
export class ApprovalRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandRecord)
  @JoinColumn({ name: 'record_id' })
  record: LandRecord;

  @Column({ name: 'record_id' })
  recordId: number;

  @Column({ name: 'request_type', length: 100 })
  requestType: string; // Mint_NFT, Recover_Wallet

  @Column({ length: 50, default: 'Pending' })
  status: string; // Pending, Approved, Rejected, Reverted

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
