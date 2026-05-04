import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'department_code', length: 50, unique: true })
  departmentCode: string; // e.g., TNMT_HN, QLDT_HN

  @Column({ name: 'department_name', length: 255 })
  departmentName: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
