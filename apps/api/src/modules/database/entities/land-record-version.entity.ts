import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LandRecord } from './land-record.entity';
import { User } from './user.entity';

@Entity('land_record_versions')
export class LandRecordVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandRecord)
  @JoinColumn({ name: 'record_id' })
  record: LandRecord;

  @Column({ name: 'record_id' })
  recordId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'editor_id' })
  editor: User;

  @Column({ name: 'editor_id' })
  editorId: number;

  @Column({ name: 'old_area', type: 'decimal', precision: 20, scale: 2, nullable: true })
  oldArea: number;

  @Column({ name: 'new_area', type: 'decimal', precision: 20, scale: 2, nullable: true })
  newArea: number;

  @Column({ name: 'old_gps_coordinates', type: 'text', nullable: true })
  oldGpsCoordinates: string;

  @Column({ name: 'new_gps_coordinates', type: 'text', nullable: true })
  newGpsCoordinates: string;

  @Column({ name: 'edit_reason', type: 'text', nullable: true })
  editReason: string;

  @Column({ name: 'version_number' })
  versionNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
