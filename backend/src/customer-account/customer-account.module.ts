import { Module } from '@nestjs/common';
import { CustomerAccountService } from './customer-account.service';
import { CustomerAccountController } from './customer-account.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PermissionsModule, AuthModule],
  providers: [CustomerAccountService, PrismaService],
  controllers: [CustomerAccountController],
  exports: [CustomerAccountService],
})
export class CustomerAccountModule {}
