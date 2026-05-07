import appDataSource from '../src/database/data-source';
import { Role } from '../src/modules/database/entities/role.entity';
import { User } from '../src/modules/database/entities/user.entity';
import { Department } from '../src/modules/database/entities/department.entity';

async function seed() {
  try {
    await appDataSource.initialize();
    console.log('Data Source has been initialized!');

    const roleRepo = appDataSource.getRepository(Role);
    const userRepo = appDataSource.getRepository(User);
    const deptRepo = appDataSource.getRepository(Department);

    // 1. Seed Roles
    const roles = [
      { roleCode: 'ADMIN', roleName: 'System Administrator', description: 'Full access to the system' },
      { roleCode: 'CAN_BO', roleName: 'Cán bộ kiểm tra', description: 'Land record reviewer' },
      { roleCode: 'LANH_DAO', roleName: 'Lãnh đạo phê duyệt', description: 'Final approver and signer' },
      { roleCode: 'CITIZEN', roleName: 'Công dân', description: 'Standard user/citizen' },
    ];

    for (const r of roles) {
      let role = await roleRepo.findOne({ where: { roleCode: r.roleCode } });
      if (!role) {
        role = roleRepo.create(r);
        await roleRepo.save(role);
        console.log(`Created role: ${r.roleCode}`);
      }
    }

    // 2. Seed Departments
    const depts = [
      { departmentCode: 'SO_TNMT', departmentName: 'Sở Tài nguyên và Môi trường', description: 'Quản lý đất đai' },
      { departmentCode: 'SO_QH_KT', departmentName: 'Sở Quy hoạch và Kiến trúc', description: 'Quản lý quy hoạch' },
    ];

    for (const d of depts) {
      let dept = await deptRepo.findOne({ where: { departmentCode: d.departmentCode } });
      if (!dept) {
        dept = deptRepo.create(d);
        await deptRepo.save(dept);
        console.log(`Created department: ${d.departmentCode}`);
      }
    }

    // 3. Seed Staff Users
    const staffUsers = [
      { vneidNumber: '048086989861', fullName: 'Cán bộ 1', roleCode: 'CAN_BO', email: 'canbo1@land-registry.gov.vn' },
      { vneidNumber: '079198692074', fullName: 'Cán bộ 2', roleCode: 'CAN_BO', email: 'canbo2@land-registry.gov.vn' },
      { vneidNumber: '079075718862', fullName: 'Cán bộ 3', roleCode: 'CAN_BO', email: 'canbo3@land-registry.gov.vn' },
      { vneidNumber: '048097919583', fullName: 'Lãnh đạo Sở', roleCode: 'LANH_DAO', email: 'lanhdao@land-registry.gov.vn' },
    ];

    const defaultDept = await deptRepo.findOne({ where: { departmentCode: 'SO_TNMT' } });

    for (const staff of staffUsers) {
      let user = await userRepo.findOne({ where: { vneidNumber: staff.vneidNumber } });
      const role = await roleRepo.findOne({ where: { roleCode: staff.roleCode } });

      if (!role || !defaultDept) {
        console.error(`Role ${staff.roleCode} or department SO_TNMT not found for ${staff.vneidNumber}`);
        continue;
      }

      if (!user) {
        user = userRepo.create({
          vneidNumber: staff.vneidNumber,
          fullName: staff.fullName,
          email: staff.email,
          status: 'Active',
          roleId: role.id,
          departmentId: defaultDept.id,
        });
        await userRepo.save(user);
        console.log(`Staff user created: ${staff.fullName} (${staff.roleCode}) - ${staff.vneidNumber}`);
      } else {
        // Update role if user already exists
        user.roleId = role.id;
        user.fullName = staff.fullName;
        await userRepo.save(user);
        console.log(`Staff user updated: ${staff.fullName} (${staff.roleCode}) - ${staff.vneidNumber}`);
      }
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
