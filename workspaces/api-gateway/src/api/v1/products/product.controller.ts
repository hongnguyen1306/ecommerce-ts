import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { MapInterceptor } from '@automapper/nestjs';

import { PagyDto } from 'dto';
import { Product } from 'database/models/product.entity';
import { GetListProductsService } from 'api/v1/products/services/GetListProductsService';
import { GetProductService } from 'api/v1/products/services/GetProductService';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/v1/products/product.vm';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getListProductsService: GetListProductsService,
    private readonly getProductService: GetProductService,
  ) {}

  @Get()
  @UseInterceptors(MapInterceptor(ProductsPagyMetadataVM, ProductsPagyVM))
  public async getList(
    @Query() queryParams: PagyDto,
  ): Promise<ProductsPagyMetadataVM> {
    const [data, total] = await this.getListProductsService.exec(queryParams);
    return {
      data,
      total,
    };
  }

  @Get('/:slug')
  @UseInterceptors(MapInterceptor(Product, ProductVM))
  public async getProduct(@Param('slug') slug: string): Promise<Product> {
    return this.getProductService.exec(slug);
  }
}
