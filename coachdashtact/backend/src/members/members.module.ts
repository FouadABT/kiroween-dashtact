import { Module, forwardRef } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PrismaModule, PermissionsModule, forwardRef(() => MessagingModule)],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
