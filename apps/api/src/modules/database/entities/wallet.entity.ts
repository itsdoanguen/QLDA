import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryColumn({ name: 'wallet_address', length: 42 })
  walletAddress: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ length: 50, default: 'Active' })
  status: string; // Active, Locked, Replaced

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
