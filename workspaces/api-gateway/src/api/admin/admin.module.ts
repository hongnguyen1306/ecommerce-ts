import { Module } from '@nestjs/common';
import type { RouteTree } from '@nestjs/core';

import { AdminProfile } from 'api/admin/admin.profile';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { ProductsModule } from 'api/admin/products/products.module';

@Module({
  imports: [CategoriesModule, ProductsModule],
  providers: [AdminProfile],
})
export class AdminModule {}

export const adminRoutes: RouteTree = {
  path: 'admin',
  module: AdminModule,
  children: [CategoriesModule, ProductsModule],
};
