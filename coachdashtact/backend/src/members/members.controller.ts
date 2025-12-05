import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateMemberDto,
  UpdateMemberDto,
  AssignCoachDto,
  UpdateOnboardingDto,
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
} from './dto';

@Controller('members')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // Coach Profile Endpoints (MUST come before dynamic :id routes)

  @Get('coaches/available')
  async getAvailableCoaches() {
    return this.membersService.getAvailableCoaches();
  }

  @Get('coach-profile/me')
  @Permissions('members:read')
  async getMyCoachProfile(@CurrentUser() user: any) {
    return this.membersService.getCoachProfile(user.id);
  }

  @Get('coach-profile/:userId')
  @Permissions('members:read')
  async getCoachProfile(@Param('userId') userId: string) {
    return this.membersService.getCoachProfile(userId);
  }

  @Post('coach-profile')
  @Permissions('members:write')
  async createCoachProfile(
    @CurrentUser() user: any,
    @Body() createCoachProfileDto: CreateCoachProfileDto,
  ) {
    return this.membersService.createCoachProfile(
      user.id,
      createCoachProfileDto,
    );
  }

  @Patch('coach-profile')
  @Permissions('members:write')
  async updateCoachProfile(
    @CurrentUser() user: any,
    @Body() updateCoachProfileDto: UpdateCoachProfileDto,
  ) {
    return this.membersService.updateCoachProfile(
      user.id,
      updateCoachProfileDto,
    );
  }

  @Get('coach/:coachId')
  @Permissions('members:read')
  async getMembersByCoach(@Param('coachId') coachId: string) {
    return this.membersService.getMembersByCoach(coachId);
  }

  // Member Profile Endpoints

  @Get('me')
  @Permissions('profile:read-own')
  async getMyProfile(@CurrentUser() user: any) {
    // Members can access their own profile
    const profiles = await this.membersService.findAll(user.id, user.role.name);
    if (profiles.length === 0) {
      throw new NotFoundException('Member profile not found');
    }
    return profiles[0];
  }

  @Get()
  @Permissions('members:read')
  async findAll(@CurrentUser() user: any) {
    return this.membersService.findAll(user.id, user.role.name);
  }

  @Post()
  @Permissions('members:write')
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Patch(':id/assign-coach')
  @Permissions('members:assign')
  async assignCoach(
    @Param('id') id: string,
    @Body() assignCoachDto: AssignCoachDto,
  ) {
    return this.membersService.assignCoach(id, assignCoachDto);
  }

  @Patch(':id/onboarding')
  @Permissions('members:write')
  async updateOnboarding(
    @Param('id') id: string,
    @Body() updateOnboardingDto: UpdateOnboardingDto,
  ) {
    return this.membersService.updateOnboardingStatus(id, updateOnboardingDto);
  }

  @Get(':id')
  @Permissions('members:read')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.membersService.findOne(id, user.id, user.role.name);
  }

  @Patch(':id')
  @Permissions('members:write')
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }
}
