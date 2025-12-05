import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchRegistryService } from './search-registry.service';
import { UsersSearchProvider } from './providers/users-search.provider';
import { ProductsSearchProvider } from './providers/products-search.provider';
import { BlogPostsSearchProvider } from './providers/blog-posts-search.provider';
import { PagesSearchProvider } from './providers/pages-search.provider';
import { CustomersSearchProvider } from './providers/customers-search.provider';
import { OrdersSearchProvider } from './providers/orders-search.provider';

@Module({
  imports: [
    PrismaModule,
    PermissionsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchRegistryService,
    UsersSearchProvider,
    ProductsSearchProvider,
    BlogPostsSearchProvider,
    PagesSearchProvider,
    CustomersSearchProvider,
    OrdersSearchProvider,
  ],
  exports: [SearchService, SearchRegistryService],
})
export class SearchModule {}
