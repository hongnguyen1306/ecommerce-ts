import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MapInterceptor } from '@automapper/nestjs';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import type { Repository } from 'typeorm';

import {
  CreateProductDto,
  UpdateProductDto,
} from 'api/admin/products/products.dto';
import { PagyDto } from 'dto';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/admin/products/products.vm';
import { Product } from 'database/models/product.entity';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { GetListProductsService } from 'api/admin/products/services/GetListProductsService';
import { UpdateProductService } from 'api/admin/products/services/UpdateProductService';
import { DeleteProductService } from 'api/admin/products/services/DeleteProductService';
import { RolesGuard } from 'api/admin/guard/roles.guard';
import { Roles } from 'api/admin/guard/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('products')
export class ProductsController {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly createProductService: CreateProductService,
    private readonly getListProductsService: GetListProductsService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
  ) {}

  @Post()
  @UseInterceptors(MapInterceptor(Product, ProductVM))
  public async create(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.createProductService.exec(createProductDto);
  }

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
    return this.productRepository
      .createQueryBuilder()
      .where('slug = :key or id::varchar = :key', {
        key: slug,
      })
      .getOne();
  }

  @Put('/:slug')
  @UseInterceptors(MapInterceptor(Product, ProductVM))
  public async update(
    @Param('slug') slug: string,
    @Body() params: UpdateProductDto,
  ): Promise<Product> {
    return this.updateProductService.exec({ slug, ...params });
  }

  @Delete('/:slug')
  public async softDelete(@Param('slug') slug: string): Promise<string> {
    return this.deleteProductService.exec(slug);
  }
}
