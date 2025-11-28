import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { FileAccessMiddleware } from './middleware/file-access.middleware';
import { UsageTracker } from './helpers/usage-tracker';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, FileAccessMiddleware, UsageTracker],
  exports: [UploadsService, UsageTracker],
})
export class UploadsModule {
  // Middleware removed - static files are served directly by Express
  // Access control is handled by visibility settings and controller permissions
}
