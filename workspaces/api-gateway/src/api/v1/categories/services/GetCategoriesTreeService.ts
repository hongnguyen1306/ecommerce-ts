import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';

@Injectable()
export class GetCategoriesTreeService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  public async exec(slug: string): Promise<Category> {
    const findCategory = await this.categoryRepository.findOne({
      where: { slug },
    });

    if (!findCategory) {
      throw new NotFoundException(`Not found ${slug}`);
    }

    return this.categoryRepository.manager
      .getTreeRepository(Category)
      .findDescendantsTree(findCategory);
  }
}
