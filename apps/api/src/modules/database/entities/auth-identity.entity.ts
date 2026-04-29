import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('auth_identities')
export class AuthIdentity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  provider: string; // e.g., 'vneid'

  @Column({ name: 'provider_id', length: 255 })
  providerId: string; // e.g., Số CCCD

  @Column({ name: 'auth_level', length: 50, nullable: true })
  authLevel: string; // e.g., 'loa1', 'loa2'

  @Column({ name: 'last_verified_at', type: 'timestamp', nullable: true })
  lastVerifiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
