import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto } from './dto';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shippingMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }

    return method;
  }

  async create(dto: CreateShippingMethodDto) {
    return this.prisma.shippingMethod.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateShippingMethodDto) {
    await this.findOne(id);

    return this.prisma.shippingMethod.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.shippingMethod.delete({
      where: { id },
    });
  }

  async getActiveShippingMethods() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }
}
