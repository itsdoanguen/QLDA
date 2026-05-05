import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { LandFile } from './land-file.entity';
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

  @Column({ name: 'plot_number', type: 'varchar', length: 20, nullable: true })
  plotNumber: string; // Số tờ bản đồ

  @Column({ name: 'parcel_number', type: 'varchar', length: 20, nullable: true })
  parcelNumber: string; // Số thửa đất

  @Column({ name: 'land_type', type: 'varchar', length: 50, nullable: true })
  landType: string; // Loại đất

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  area: number;

  @Column({ name: 'gps_coordinates', type: 'text', nullable: true })
  gpsCoordinates: string; // Tọa độ / Polygon hiện hành

  @Column({ name: 'assigned_cb_id', type: 'integer', nullable: true })
  assignedCbId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_cb_id' })
  assignedCb: User;

  @Column({ name: 'is_frozen', type: 'boolean', default: false })
  isFrozen: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    default: LandRecordStatus.DRAFT,
  })
  status: LandRecordStatus;

  @OneToMany(() => LandFile, (file) => file.record)
  files: LandFile[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
