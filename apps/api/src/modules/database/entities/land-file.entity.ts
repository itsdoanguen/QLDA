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

@Entity('land_files')
export class LandFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LandRecord)
  @JoinColumn({ name: 'record_id' })
  record: LandRecord;

  @Column({ name: 'record_id' })
  recordId: number;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_type', length: 50 })
  fileType: string; // JPG, PDF, PNG

  @Column({ name: 'ipfs_cid', length: 255, unique: true })
  ipfsCid: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ name: 'uploaded_by' })
  uploadedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
