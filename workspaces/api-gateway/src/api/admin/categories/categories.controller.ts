import { MapInterceptor } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PagyDto } from 'dto';
import {
  CategoriesPagyMetadataVM,
  CategoriesPagyVM,
  CategoryDescendantVM,
  CategoryVM,
} from 'api/admin/categories/categories.vm';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from 'api/admin/categories/categories.dto';
import { ProductsCategoriesVM } from 'api/admin/products/products.vm';
import { Category } from 'database/models/category.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { GetListProductInCategoryService } from 'api/admin/categories/services/GetListProductsInCategoryService';
import { UpdateCategoryService } from 'api/admin/categories/services/UpdateCategoryService';
import { GetListCategoriesService } from 'api/admin/categories/services/GetListCategoriesService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { Roles } from 'api/admin/guard/roles.decorator';
import { RolesGuard } from 'api/admin/guard/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly createCategoryService: CreateCategoryService,
    private readonly getRelatedCategoriesService: GetRelatedCategoriesService,
    private readonly getListProductInCategoryService: GetListProductInCategoryService,
    private readonly updateCategoryService: UpdateCategoryService,
    private readonly getListCategoriesService: GetListCategoriesService,
    private readonly getCategoryByKeyService: GetCategoryByKeyService,
  ) {}

  @Post()
  @UseInterceptors(MapInterceptor(Category, CategoryVM))
  public async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.createCategoryService.exec(createCategoryDto);
  }

  @Get()
  @UseInterceptors(MapInterceptor(CategoriesPagyMetadataVM, CategoriesPagyVM))
  public async getList(
    @Query() queryParams: PagyDto,
  ): Promise<CategoriesPagyMetadataVM> {
    const [data, total] = await this.getListCategoriesService.exec(queryParams);
    return {
      data,
      total,
    };
  }

  @Get('/:slug')
  @UseInterceptors(MapInterceptor(Category, CategoryDescendantVM))
  public async getCategoryByKey(
    @Param('slug') slug: string,
  ): Promise<Category> {
    return this.getCategoryByKeyService.exec(slug);
  }

  @Get('/:slug/descendants')
  @UseInterceptors(MapInterceptor(Category, CategoryDescendantVM))
  public async getDescendant(@Param('slug') slug: string): Promise<Category> {
    return this.getRelatedCategoriesService.exec({
      key: slug,
      option: 'Descendants',
    });
  }

  @Get('/:slug/products')
  @UseInterceptors(
    MapInterceptor(ProductsCategories, ProductsCategoriesVM, {
      isArray: true,
    }),
  )
  public async getListProducts(
    @Param('slug') slug: string,
  ): Promise<ProductsCategoriesVM[]> {
    return this.getListProductInCategoryService.exec(slug);
  }

  @Put('/:slug')
  @UseInterceptors(MapInterceptor(Category, CategoryVM))
  public async update(
    @Param('slug') slug: string,
    @Body() params: UpdateCategoryDto,
  ): Promise<Category> {
    return this.updateCategoryService.exec({ slug, ...params });
  }
}
