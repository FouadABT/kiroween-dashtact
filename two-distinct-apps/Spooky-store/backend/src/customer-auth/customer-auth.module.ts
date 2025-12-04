import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerAuthController } from './customer-auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    PrismaModule,
    CartModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'customer-jwt-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [CustomerAuthService],
  controllers: [CustomerAuthController],
  exports: [CustomerAuthService],
})
export class CustomerAuthModule {}
