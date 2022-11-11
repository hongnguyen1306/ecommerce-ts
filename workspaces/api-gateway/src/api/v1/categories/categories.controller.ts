import { MapInterceptor } from '@automapper/nestjs';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { Category } from 'database/models/category.entity';
import { GetCategoriesTreeService } from 'api/v1/categories/services/GetCategoriesTreeService';
import { CategoryDescendantVM } from 'api/v1/categories/categories.vm';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly getCategoriesTreeV1Service: GetCategoriesTreeService,
  ) {}

  @Get('/:slug')
  @UseInterceptors(MapInterceptor(Category, CategoryDescendantVM))
  public async getCategory(@Param('slug') slug: string): Promise<Category> {
    return this.getCategoriesTreeV1Service.exec(slug);
  }
}
