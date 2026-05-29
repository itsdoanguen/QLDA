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
  @PrimaryColumn({ name: 'wallet_address', length: 128 })
  walletAddress: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 20, default: 'Active' })
  status: string; // Active, Locked, Replaced

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
