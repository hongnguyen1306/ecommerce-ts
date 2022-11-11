import { Module } from '@nestjs/common';
import type { RouteTree } from '@nestjs/core';

import { CategoriesModule } from 'api/v1/categories/categories.module';
import { ProductsModule } from 'api/v1/products/product.module';
import { V1Profile } from 'api/v1/v1.profile';

@Module({
  imports: [ProductsModule, CategoriesModule],
  providers: [V1Profile],
})
export class V1Module {}

export const v1Routes: RouteTree = {
  path: 'api/v1',
  module: V1Module,
  children: [ProductsModule, CategoriesModule],
};
