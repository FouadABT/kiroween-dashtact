import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { authConfig } from '../config/auth.config';
import { PrismaClient } from '@prisma/client';
import { PermissionsModule } from '../permissions/permissions.module';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { TokenBlacklistCleanupService } from './services/token-blacklist-cleanup.service';
import { AuditLoggingService } from './services/audit-logging.service';
import { PasswordResetService } from './services/password-reset.service';
import { TwoFactorService } from './services/two-factor.service';
import { TwoFactorCleanupService } from './services/two-factor-cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: authConfig.jwt.secret,
      signOptions: {
        expiresIn: authConfig.tokens.accessTokenExpiration as any,
      },
    }),
    forwardRef(() => PermissionsModule),
    forwardRef(() => NotificationsModule),
    forwardRef(() => ActivityLogModule),
    forwardRef(() => EmailModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaClient,
    PermissionsGuard,
    RolesGuard,
    PrismaService,
    TokenBlacklistCleanupService,
    AuditLoggingService,
    PasswordResetService,
    TwoFactorService,
    TwoFactorCleanupService,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    PermissionsGuard,
    RolesGuard,
    AuditLoggingService,
  ],
})
export class AuthModule {}
