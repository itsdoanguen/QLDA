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

    // 3. Seed Admin User
    const adminCCCD = '048086989861';
    let admin = await userRepo.findOne({ where: { vneidNumber: adminCCCD } });
    
    if (!admin) {
      const adminRole = await roleRepo.findOne({ where: { roleCode: 'ADMIN' } });
      const dept = await deptRepo.findOne({ where: { departmentCode: 'SO_TNMT' } });

      if (!adminRole || !dept) {
        throw new Error('Required role or department not found. Please ensure roles and departments are seeded first.');
      }

      admin = userRepo.create({
        vneidNumber: adminCCCD,
        fullName: 'Super Admin',
        email: 'admin@land-registry.gov.vn',
        status: 'Active',
        roleId: adminRole.id,
        departmentId: dept.id,
      });
      await userRepo.save(admin);
      console.log(`Admin user created with CCCD: ${adminCCCD}`);
    } else {
      console.log(`Admin user with CCCD ${adminCCCD} already exists.`);
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
