import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UsersModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
