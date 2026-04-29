import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { LandRecord } from './land-record.entity';
import { PlanningZone } from './planning-zone.entity';

@Entity('land_planning_map')
export class LandPlanningMap {
  @PrimaryColumn({ name: 'record_id' })
  recordId: number;

  @ManyToOne(() => LandRecord)
  @JoinColumn({ name: 'record_id' })
  record: LandRecord;

  @PrimaryColumn({ name: 'zone_id' })
  zoneId: number;

  @ManyToOne(() => PlanningZone)
  @JoinColumn({ name: 'zone_id' })
  zone: PlanningZone;

  @Column({ length: 50 })
  status: string; // Safe, Warning, Danger
}
