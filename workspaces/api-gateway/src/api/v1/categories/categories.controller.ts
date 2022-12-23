import { MapInterceptor } from '@automapper/nestjs';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';

import { Category } from 'database/models/category.entity';
import { GetCategoriesTreeService } from 'api/v1/categories/services/GetCategoriesTreeService';
import {
  CategoryDescendantVM,
  CategoryVM,
} from 'api/v1/categories/categories.vm';
import { GetListCategoriesService } from 'api/v1/categories/services/GetListCategoriesService';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly getCategoriesTreeService: GetCategoriesTreeService,
    private readonly getListCategoriesService: GetListCategoriesService,
  ) {}

  @Get()
  @UseInterceptors(MapInterceptor(Category, CategoryVM, { isArray: true }))
  public async getListCategories(): Promise<Category[]> {
    return this.getListCategoriesService.exec();
  }

  @Get('/:slug')
  @UseInterceptors(MapInterceptor(Category, CategoryDescendantVM))
  public async getCategory(@Param('slug') slug: string): Promise<Category> {
    return this.getCategoriesTreeService.exec(slug);
  }
}
