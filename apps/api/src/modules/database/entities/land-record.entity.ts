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
import { LandRecordStatus } from '../../../common/enums/land-record-status.enum';

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

  @Column({
    type: 'varchar',
    length: 50,
    default: LandRecordStatus.DRAFT,
  })
  status: LandRecordStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
