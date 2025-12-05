import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CapabilitiesService } from './capabilities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CapabilitiesResponseDto } from './dto/capabilities-response.dto';

@ApiTags('capabilities')
@Controller('capabilities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get system capabilities',
    description:
      'Returns comprehensive system information including available widgets, ' +
      'user permissions, feature flags, layout templates, navigation structure, ' +
      'and system metadata. Optimized for AI agent discovery. Response is cached for 5 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'System capabilities retrieved successfully',
    type: CapabilitiesResponseDto,
  })
  async getCapabilities(@CurrentUser() user: any): Promise<CapabilitiesResponseDto> {
    return this.capabilitiesService.getCapabilities(user);
  }
}
