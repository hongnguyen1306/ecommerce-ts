import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from 'database/models/product.entity';
import { ProductsController } from 'api/v1/products/products.controller';
import { GetListProductsService } from 'api/v1/products/services/GetListProductsService';
import { GetProductService } from 'api/v1/products/services/GetProductService';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [GetListProductsService, GetProductService],
  controllers: [ProductsController],
})
export class ProductsModule {}
