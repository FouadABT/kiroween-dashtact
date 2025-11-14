import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
  CustomerResponseDto,
  CustomerListResponseDto,
  CustomerStatisticsDto,
} from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all customers with pagination and search
   */
  async findAll(
    query: CustomerQueryDto,
  ): Promise<CustomerListResponseDto> {
    const { search, tag, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    // Get total count
    const total = await this.prisma.customer.count({ where });

    // Get customers
    const customers = await this.prisma.customer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Calculate total spent for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await this.prisma.order.findMany({
          where: { customerId: customer.id },
          select: { total: true },
        });

        const totalSpent = orders.reduce(
          (sum, order) => sum + Number(order.total),
          0,
        );

        return {
          ...customer,
          orderCount: customer._count.orders,
          totalSpent,
        };
      }),
    );

    return {
      customers: customersWithStats as CustomerResponseDto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one customer by ID with order history
   */
  async findOne(id: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Calculate total spent
    const orders = await this.prisma.order.findMany({
      where: { customerId: id },
      select: { total: true },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      ...customer,
      orderCount: customer._count.orders,
      totalSpent,
    } as CustomerResponseDto;
  }

  /**
   * Create a new customer
   */
  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    // Check if email already exists
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        company: dto.company,
        shippingAddress: dto.shippingAddress ? (dto.shippingAddress as any) : undefined,
        billingAddress: dto.billingAddress ? (dto.billingAddress as any) : undefined,
        notes: dto.notes,
        tags: dto.tags || [],
      },
    });

    return {
      ...customer,
      orderCount: 0,
      totalSpent: 0,
    } as CustomerResponseDto;
  }

  /**
   * Update a customer
   */
  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // Check if customer exists
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });

      if (emailTaken) {
        throw new ConflictException('Email is already taken');
      }
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        company: dto.company,
        shippingAddress: dto.shippingAddress ? (dto.shippingAddress as any) : undefined,
        billingAddress: dto.billingAddress ? (dto.billingAddress as any) : undefined,
        notes: dto.notes,
        tags: dto.tags,
      },
    });

    // Calculate total spent and order count
    const orders = await this.prisma.order.findMany({
      where: { customerId: id },
      select: { total: true },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      ...customer,
      orderCount: orders.length,
      totalSpent,
    } as CustomerResponseDto;
  }

  /**
   * Delete a customer (only if no orders)
   */
  async delete(id: string): Promise<void> {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check if customer has orders
    if (customer._count.orders > 0) {
      throw new BadRequestException(
        'Cannot delete customer with existing orders',
      );
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }

  /**
   * Generate a secure portal token for customer
   */
  async generatePortalToken(id: string): Promise<any> {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Generate secure token (32 bytes = 64 hex characters)
    const token = randomBytes(32).toString('hex');

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update customer with token and return updated customer
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        portalToken: token,
        portalExpiresAt: expiresAt,
      },
    });

    return updatedCustomer;
  }

  /**
   * Get customer by portal token
   */
  async getByPortalToken(token: string): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { portalToken: token },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Invalid or expired portal token');
    }

    // Check if token is expired
    if (customer.portalExpiresAt && customer.portalExpiresAt < new Date()) {
      throw new BadRequestException('Portal token has expired');
    }

    // Calculate total spent
    const orders = await this.prisma.order.findMany({
      where: { customerId: customer.id },
      select: { total: true },
    });

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      ...customer,
      orderCount: customer._count.orders,
      totalSpent,
    } as CustomerResponseDto;
  }

  /**
   * Get customer order history
   */
  async getOrderHistory(id: string) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const orders = await this.prisma.order.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                featuredImage: true,
              },
            },
          },
        },
      },
    });

    return orders;
  }

  /**
   * Get customer statistics
   */
  async getStatistics(id: string): Promise<CustomerStatisticsDto> {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const orders = await this.prisma.order.findMany({
      where: { customerId: id },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const firstOrderDate = orders.length > 0 ? orders[0].createdAt : undefined;
    const lastOrderDate = orders.length > 0 ? orders[orders.length - 1].createdAt : undefined;

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      firstOrderDate,
      lastOrderDate,
    };
  }
}
