import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if this is a fresh install (no Super Admin user exists)
   */
  async isFirstRun(): Promise<boolean> {
    try {
      const superAdminRole = await this.prisma.userRole.findUnique({
        where: { name: 'Super Admin' },
      });

      if (!superAdminRole) {
        return true;
      }

      const superAdminUser = await this.prisma.user.findFirst({
        where: { roleId: superAdminRole.id },
      });

      return !superAdminUser;
    } catch (error) {
      this.logger.error('Error checking first run status:', error);
      return true;
    }
  }

  /**
   * Get the current setup status
   */
  async getSetupStatus(): Promise<{ isFirstRun: boolean; setupCompleted: boolean }> {
    const isFirstRun = await this.isFirstRun();
    const setupCompleted = !isFirstRun;

    return {
      isFirstRun,
      setupCompleted,
    };
  }

  /**
   * Create default admin account for fresh installations
   * Only creates if no Super Admin user exists
   */
  async createDefaultAdminAccount(): Promise<void> {
    try {
      const isFirstRun = await this.isFirstRun();

      if (!isFirstRun) {
        this.logger.log('Admin account already exists, skipping creation');
        return;
      }

      // Get or create Super Admin role
      let superAdminRole = await this.prisma.userRole.findUnique({
        where: { name: 'Super Admin' },
      });

      if (!superAdminRole) {
        this.logger.warn('Super Admin role not found, creating it');
        superAdminRole = await this.prisma.userRole.create({
          data: {
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            isSystemRole: true,
            isActive: true,
          },
        });
      }

      // Hash the default password
      const defaultPassword = 'dashtact';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      // Create default admin account
      const adminUser = await this.prisma.user.create({
        data: {
          email: 'admin@dashtact.com',
          name: 'Administrator',
          password: hashedPassword,
          roleId: superAdminRole.id,
          isActive: true,
          emailVerified: true,
        },
      });

      this.logger.log('✅ Default admin account created successfully');
      this.logger.log(`📧 Email: ${adminUser.email}`);
      this.logger.log(`🔑 Password: ${defaultPassword}`);
      this.logger.warn(
        '⚠️  IMPORTANT: Change the default password immediately after first login!',
      );
    } catch (error) {
      this.logger.error('Error creating default admin account:', error);
      throw error;
    }
  }
}
