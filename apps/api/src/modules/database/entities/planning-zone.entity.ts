import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('planning_zones')
export class PlanningZone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'zone_name', length: 255 })
  zoneName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'polygon_coordinates', type: 'text', nullable: true })
  polygonCoordinates: string;

  @Column({ length: 50, nullable: true })
  status: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
