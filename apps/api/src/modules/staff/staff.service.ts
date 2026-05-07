import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Department } from '../database/entities/department.entity';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async createStaff(data: any) {
    const existing = await this.userRepository.findOne({ where: { vneidNumber: data.vneidNumber } });
    if (existing) {
      throw new ConflictException('Staff with this VNeID already exists');
    }

    const staff = this.userRepository.create({
      ...data,
      status: 'Active',
    });

    return this.userRepository.save(staff);
  }

  async listStaff(filters: any) {
    return this.userRepository.find({
      where: filters,
      relations: ['role', 'department'],
    });
  }

  async deactivateStaff(id: number) {
    const staff = await this.userRepository.findOne({ where: { id } });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    staff.status = 'Deactivated';
    return this.userRepository.save(staff);
  }

  async getStaffById(id: number) {
    const staff = await this.userRepository.findOne({ 
      where: { id },
      relations: ['role', 'department'] 
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }
}
