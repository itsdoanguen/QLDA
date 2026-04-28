import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Wallet } from './wallet.entity';

@Entity('wallet_secrets')
export class WalletSecret {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_address', length: 42, unique: true })
  walletAddress: string;

  @OneToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_address', referencedColumnName: 'walletAddress' })
  wallet: Wallet;

  @Column({ name: 'encrypted_private_key', type: 'text' })
  encryptedPrivateKey: string;

  @Column({ name: 'iv', length: 24 })
  iv: string;

  @Column({ name: 'auth_tag', length: 32 })
  authTag: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
