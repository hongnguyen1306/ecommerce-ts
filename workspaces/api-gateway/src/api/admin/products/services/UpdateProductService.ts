import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { createSlug } from 'utils';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import type { UpdateProductDto } from 'api/admin/products/products.dto';

@Injectable()
export class UpdateProductService {
  constructor(
    private readonly checkProductExistedService: CheckProductExistedService,
    private readonly createProductCategoryService: CreateProductCategoryService,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductsCategories)
    private productCategoryRepository: Repository<ProductsCategories>,
  ) {}

  public async exec({
    slug,
    name,
    categoryId,
    ...data
  }: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: {
        slug,
      },
    });

    if (!product) {
      throw new NotFoundException(`Not found ${slug}`);
    }

    if (name && product.name !== name) {
      slug = await createSlug(
        { name, columnName: 'slug' },
        this.checkProductExistedService.exec.bind(
          this.checkProductExistedService,
        ),
      );
    }

    Object.assign(product, {
      name,
      slug,
      categoryId,
      ...data,
    });

    await this.productRepository.save(product);

    if (categoryId && product.categoryId !== categoryId) {
      await this.productCategoryRepository.delete({ productId: product.id });
      await this.createProductCategoryService.exec({
        productId: product.id,
        categoryId,
      });
    }

    return product;
  }
}
