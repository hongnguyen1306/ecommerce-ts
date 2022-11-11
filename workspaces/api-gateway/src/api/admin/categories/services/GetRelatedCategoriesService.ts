import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';

interface IParamsGetListCats {
  key: string;
  option: 'Descendants' | 'Ancestors';
}

@Injectable()
export class GetRelatedCategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private getCategoryByKeyService: GetCategoryByKeyService,
  ) {}

  public async exec({ key, option }: IParamsGetListCats): Promise<Category> {
    const category = await this.getCategoryByKeyService.exec(key);

    const findTree = new TreeRepository(
      Category,
      this.categoryRepository.manager,
    );

    return findTree[`find${option}Tree`](category);
  }
}
