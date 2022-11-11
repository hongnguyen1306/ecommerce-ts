import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { ProductsCategories } from 'database/models/productsCategories.entity';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { getlistCategoryIds } from 'api/admin/categories/helper';
import type { CreateProCateDto } from 'api/admin/products/products.dto';

@Injectable()
export class CreateProductCategoryService {
  constructor(
    private getRelatedCategoriesService: GetRelatedCategoriesService,

    @InjectRepository(ProductsCategories)
    private proCateRepository: Repository<ProductsCategories>,
  ) {}

  public async exec(
    createProCateDto: CreateProCateDto,
  ): Promise<ProductsCategories[]> {
    const { categoryId, productId } = createProCateDto;

    const listCategories = await this.getRelatedCategoriesService.exec({
      key: categoryId,
      option: 'Ancestors',
    });

    const listCategoryIds = getlistCategoryIds(listCategories);

    const newProCats = listCategoryIds.map((categoryId) => {
      return this.proCateRepository.create({
        productId,
        categoryId,
      });
    });

    try {
      return this.proCateRepository.save(newProCats);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
