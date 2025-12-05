import { Module } from '@nestjs/common';
import { CustomerOrdersService } from './customer-orders.service';
import { CustomerOrdersController } from './customer-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersModule } from '../orders/orders.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [PrismaModule, OrdersModule, CartModule],
  providers: [CustomerOrdersService],
  controllers: [CustomerOrdersController],
  exports: [CustomerOrdersService],
})
export class CustomerOrdersModule {}
