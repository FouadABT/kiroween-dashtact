import { Module } from '@nestjs/common';
import { CapabilitiesController } from './capabilities.controller';
import { CapabilitiesService } from './capabilities.service';
import { WidgetsModule } from '../widgets/widgets.module';
import { DashboardLayoutsModule } from '../dashboard-layouts/dashboard-layouts.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    WidgetsModule,
    DashboardLayoutsModule,
    AuthModule,
  ],
  controllers: [CapabilitiesController],
  providers: [CapabilitiesService],
  exports: [CapabilitiesService],
})
export class CapabilitiesModule {}
