import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersModule } from '../customers/customers.module';
import { ProductsModule } from '../products/products.module';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CustomersModule,
    ProductsModule,
    InventoryModule,
    NotificationsModule,
    PermissionsModule,
    AuthModule,
  ],
  providers: [OrdersService, PrismaService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
