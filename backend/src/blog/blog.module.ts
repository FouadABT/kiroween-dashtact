import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [PermissionsModule, UploadsModule],
  controllers: [BlogController],
  providers: [BlogService, PrismaService],
  exports: [BlogService],
})
export class BlogModule {}
