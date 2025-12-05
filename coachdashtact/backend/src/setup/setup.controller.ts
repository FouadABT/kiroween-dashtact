import { Controller, Get } from '@nestjs/common';
import { SetupService } from './setup.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  /**
   * Get the current setup status
   * This endpoint is public (no authentication required)
   */
  @Public()
  @Get('status')
  async getSetupStatus(): Promise<{ isFirstRun: boolean; setupCompleted: boolean }> {
    return this.setupService.getSetupStatus();
  }
}
