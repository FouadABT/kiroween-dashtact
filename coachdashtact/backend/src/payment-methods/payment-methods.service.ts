import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return method;
  }

  async create(dto: CreatePaymentMethodDto) {
    return this.prisma.paymentMethod.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdatePaymentMethodDto) {
    await this.findOne(id);

    return this.prisma.paymentMethod.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }

  async getActivePaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
