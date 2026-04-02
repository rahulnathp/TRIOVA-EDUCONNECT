import { MigrationInterface, QueryRunner } from 'typeorm';
import { User, UserRole } from '../../user/user.entity';
import * as bcrypt from 'bcrypt';

export class CreateAdminUser1712042400000 implements MigrationInterface {
  name = '1712042400000_create_admin_user';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@triova.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = userRepository.create({
        email: 'admin@triova.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });
      await userRepository.save(adminUser);
      console.log('✓ Default admin user created: admin@triova.com / admin123');
    } else {
      console.log('✓ Admin user already exists, skipping');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const userRepository = queryRunner.manager.getRepository(User);
    await userRepository.delete({ email: 'admin@triova.com' });
    console.log('✓ Admin user deleted');
  }
}
