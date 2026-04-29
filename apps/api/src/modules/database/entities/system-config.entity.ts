import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryColumn({ name: 'config_key' })
  configKey: string; // TAX_RATE_TNCN, TAX_RATE_TRUCBA, etc.

  @Column({ name: 'config_value', type: 'text' })
  configValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
