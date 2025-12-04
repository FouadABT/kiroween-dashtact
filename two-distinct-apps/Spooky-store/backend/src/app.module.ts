import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { PermissionsModule } from './permissions/permissions.module';
import { UploadsModule } from './uploads/uploads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BlogModule } from './blog/blog.module';
import { LandingModule } from './landing/landing.module';
import { PagesModule } from './pages/pages.module';
import { ProfileModule } from './profile/profile.module';
import { authConfig } from './config/auth.config';
import { CustomersModule } from './customers/customers.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { EcommerceSettingsModule } from './ecommerce-settings/ecommerce-settings.module';
import { CartModule } from './cart/cart.module';
import { StorefrontModule } from './storefront/storefront.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CustomerOrdersModule } from './customer-orders/customer-orders.module';
import { WidgetsModule } from './widgets/widgets.module';
import { DashboardLayoutsModule } from './dashboard-layouts/dashboard-layouts.module';
import { CapabilitiesModule } from './capabilities/capabilities.module';
import { DashboardMenusModule } from './dashboard-menus/dashboard-menus.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { EmailModule } from './email/email.module';
import { LegalPagesModule } from './legal-pages/legal-pages.module';
import { MessagingSettingsModule } from './messaging-settings/messaging-settings.module';
import { MessagingModule } from './messaging/messaging.module';
import { BrandingModule } from './branding/branding.module';
import { SearchModule } from './search/search.module';
import { CronJobsModule } from './cron-jobs/cron-jobs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CalendarModule } from './calendar/calendar.module';
import { CustomerAccountModule } from './customer-account/customer-account.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { SetupModule } from './setup/setup.module';
import { FeaturesModule } from './features/features.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: authConfig.security.rateLimit.ttl * 1000, // Convert seconds to milliseconds
        limit: authConfig.security.rateLimit.max,
      },
    ]),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes default TTL in milliseconds
      max: 100, // Maximum number of items in cache
    }),
    CronJobsModule,
    UsersModule,
    SettingsModule,
    AuthModule,
    PermissionsModule,
    UploadsModule,
    NotificationsModule,
    BlogModule,
    LandingModule,
    PagesModule,
    ProfileModule,
    CustomersModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    EcommerceSettingsModule,
    CartModule,
    StorefrontModule,
    CustomerAuthModule,
    CheckoutModule,
    CustomerOrdersModule,
    WidgetsModule,
    DashboardLayoutsModule,
    CapabilitiesModule,
    DashboardMenusModule,
    ActivityLogModule,
    EmailModule,
    LegalPagesModule,
    MessagingSettingsModule,
    MessagingModule,
    BrandingModule,
    SearchModule,
    DashboardModule,
    CalendarModule,
    CustomerAccountModule,
    ShippingModule,
    PaymentMethodsModule,
    SetupModule,
    FeaturesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    // Global activity logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: require('./activity-log/interceptors/activity-logging.interceptor')
        .ActivityLoggingInterceptor,
    },
    // Rate limiting disabled globally - uncomment to enable
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
