import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import * as bcrypt from 'bcrypt';
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  CustomerProfileDto,
  CustomerAuthResponseDto,
  UpdateCustomerProfileDto,
} from './dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Register a new customer
   */
  async register(dto: RegisterCustomerDto): Promise<CustomerAuthResponseDto> {
    // Check if email already exists
    const existingAccount = await this.prisma.customerAccount.findUnique({
      where: { email: dto.email },
    });

    if (existingAccount) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create customer first
    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    // Create customer account
    const account = await this.prisma.customerAccount.create({
      data: {
        customerId: customer.id,
        email: dto.email,
        password: hashedPassword,
      },
      include: {
        customer: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(account.id, account.email);

    return {
      ...tokens,
      customer: this.formatCustomerProfile(account),
    };
  }

  /**
   * Login customer
   */
  async login(dto: LoginCustomerDto): Promise<CustomerAuthResponseDto> {
    // Find customer account
    const account = await this.prisma.customerAccount.findUnique({
      where: { email: dto.email },
      include: {
        customer: true,
      },
    });

    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, account.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.customerAccount.update({
      where: { id: account.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(account.id, account.email);

    return {
      ...tokens,
      customer: this.formatCustomerProfile(account),
    };
  }

  /**
   * Logout customer (blacklist token)
   */
  async logout(token: string, userId: string): Promise<void> {
    // Decode token to get expiration
    const decoded = this.jwtService.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await this.prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'customer-jwt-secret',
      });

      // Check if token is blacklisted
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token: refreshToken },
      });

      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          type: 'customer',
        },
        {
          secret: process.env.JWT_SECRET || 'customer-jwt-secret',
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'customer-jwt-secret',
      });

      // Check if token is blacklisted
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token },
      });

      return !blacklisted;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get customer profile
   */
  async getProfile(userId: string): Promise<CustomerProfileDto> {
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: userId },
      include: {
        customer: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    return this.formatCustomerProfile(account);
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    userId: string,
    dto: UpdateCustomerProfileDto,
  ): Promise<CustomerProfileDto> {
    const account = await this.prisma.customerAccount.findUnique({
      where: { id: userId },
      include: {
        customer: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Customer not found');
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== account.email) {
      const existingAccount = await this.prisma.customerAccount.findUnique({
        where: { email: dto.email },
      });

      if (existingAccount) {
        throw new ConflictException('Email already in use');
      }

      // Update email in customer account
      await this.prisma.customerAccount.update({
        where: { id: userId },
        data: { email: dto.email },
      });
    }

    // Update customer data
    const updatedCustomer = await this.prisma.customer.update({
      where: { id: account.customerId },
      data: {
        email: dto.email ?? account.customer.email,
        firstName: dto.firstName ?? account.customer.firstName,
        lastName: dto.lastName ?? account.customer.lastName,
        phone: dto.phone ?? account.customer.phone,
        company: dto.company ?? account.customer.company,
        shippingAddress: dto.shippingAddress ?? account.customer.shippingAddress,
        billingAddress: dto.billingAddress ?? account.customer.billingAddress,
      },
    });

    // Fetch updated account
    const updatedAccount = await this.prisma.customerAccount.findUnique({
      where: { id: userId },
      include: {
        customer: true,
      },
    });

    return this.formatCustomerProfile(updatedAccount!);
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: userId,
      email,
      type: 'customer',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'customer-jwt-secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'customer-jwt-secret',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  /**
   * Format customer profile response
   */
  private formatCustomerProfile(account: any): CustomerProfileDto {
    return {
      id: account.id,
      email: account.email,
      firstName: account.customer.firstName,
      lastName: account.customer.lastName,
      phone: account.customer.phone,
      emailVerified: account.emailVerified,
      lastLogin: account.lastLogin,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      customer: {
        id: account.customer.id,
        email: account.customer.email,
        firstName: account.customer.firstName,
        lastName: account.customer.lastName,
        phone: account.customer.phone,
        company: account.customer.company,
        shippingAddress: account.customer.shippingAddress,
        billingAddress: account.customer.billingAddress,
      },
    };
  }
}
