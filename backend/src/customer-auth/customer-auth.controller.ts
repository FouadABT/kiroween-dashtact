import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  UpdateCustomerProfileDto,
} from './dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CartService } from '../cart/cart.service';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Register new customer
   * POST /customer-auth/register
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterCustomerDto) {
    return this.customerAuthService.register(dto);
  }

  /**
   * Login customer
   * POST /customer-auth/login
   */
  @Public()
  @Post('login')
  async login(@Body() dto: LoginCustomerDto) {
    const result = await this.customerAuthService.login(dto);

    // Merge guest cart if sessionId provided
    if (dto.sessionId) {
      try {
        await this.cartService.mergeCart(dto.sessionId, result.customer.id);
      } catch (error) {
        // Log error but don't fail login
        console.error('Failed to merge cart:', error);
      }
    }

    return result;
  }

  /**
   * Logout customer
   * POST /customer-auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Headers('authorization') authorization: string,
    @CurrentUser() user: any,
  ) {
    const token = authorization?.replace('Bearer ', '');
    await this.customerAuthService.logout(token, user.id);
    return { message: 'Logged out successfully' };
  }

  /**
   * Refresh access token
   * POST /customer-auth/refresh
   */
  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.customerAuthService.refreshToken(refreshToken);
  }

  /**
   * Get customer profile
   * GET /customer-auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.customerAuthService.getProfile(user.id);
  }

  /**
   * Update customer profile
   * PATCH /customer-auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.customerAuthService.updateProfile(user.id, dto);
  }
}
