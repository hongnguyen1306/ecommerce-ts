import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from 'api/admin/categories/categories.controller';
import { Category } from 'database/models/category.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { GetListProductInCategoryService } from 'api/admin/categories/services/GetListProductsInCategoryService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { UpdateCategoryService } from 'api/admin/categories/services/UpdateCategoryService';
import { GetListCategoriesService } from 'api/admin/categories/services/GetListCategoriesService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ProductsCategories])],
  providers: [
    GetRelatedCategoriesService,
    GetListProductInCategoryService,
    CheckCategoryExistedService,
    CreateCategoryService,
    UpdateCategoryService,
    GetListCategoriesService,
    GetCategoryByKeyService,
  ],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
