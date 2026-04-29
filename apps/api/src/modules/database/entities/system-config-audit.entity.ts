import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { SystemConfig } from './system-config.entity';
import { User } from './user.entity';

@Entity('system_config_audits')
export class SystemConfigAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SystemConfig)
  @JoinColumn({ name: 'config_key' })
  config: SystemConfig;

  @Column({ name: 'config_key' })
  configKey: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'editor_id' })
  editor: User;

  @Column({ name: 'editor_id' })
  editorId: number;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue: string;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
