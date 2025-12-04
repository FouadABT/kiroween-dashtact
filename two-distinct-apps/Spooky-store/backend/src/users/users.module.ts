import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [AuthModule, PermissionsModule, forwardRef(() => NotificationsModule), UploadsModule],
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService, PrismaService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
