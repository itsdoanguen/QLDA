import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'role_code', length: 20, unique: true })
  roleCode: string;

  @Column({ name: 'role_name', length: 100 })
  roleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
