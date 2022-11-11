import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ProductsCategories } from 'database/models/productsCategories.entity';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';

@Injectable()
export class GetListProductInCategoryService {
  constructor(
    @InjectRepository(ProductsCategories)
    private proCateRepository: Repository<ProductsCategories>,
    private getCategoryByKeyService: GetCategoryByKeyService,
  ) {}

  public async exec(slug: string): Promise<ProductsCategories[]> {
    const category = await this.getCategoryByKeyService.exec(slug);
    const listProducts = await this.proCateRepository
      .createQueryBuilder('products_categories')
      .innerJoinAndSelect('products_categories.product', 'products')
      .where('products_categories.category_id = :id', {
        id: category.id,
      })
      .getMany();

    return listProducts;
  }
}
