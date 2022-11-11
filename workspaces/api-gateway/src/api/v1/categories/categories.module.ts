import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesController } from 'api/v1/categories/categories.controller';
import { GetCategoriesTreeService } from 'api/v1/categories/services/GetCategoriesTreeService';
import { Category } from 'database/models/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [GetCategoriesTreeService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
