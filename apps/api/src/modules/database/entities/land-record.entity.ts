import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('land_records')
export class LandRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  area: number;

  @Column({ name: 'gps_coordinates', type: 'text', nullable: true })
  gpsCoordinates: string; // Tọa độ / Polygon hiện hành

  @Column({ name: 'is_frozen', type: 'boolean', default: false })
  isFrozen: boolean;

  @Column({ length: 50 })
  status: string; // Draft, Chờ đối soát, Cần bổ sung, Đã đối soát, Đã Mint

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
