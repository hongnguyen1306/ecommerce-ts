import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';

@Injectable()
export class GetCategoryByKeyService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  public async exec(key: string): Promise<Category> {
    const findCategory = await this.categoryRepository
      .createQueryBuilder('categories')
      .where('slug = :key or id::varchar = :key', {
        key: key,
      })
      .getOne();

    if (!findCategory) {
      throw new NotFoundException(`Not found ${key}`);
    }

    return findCategory;
  }
}
