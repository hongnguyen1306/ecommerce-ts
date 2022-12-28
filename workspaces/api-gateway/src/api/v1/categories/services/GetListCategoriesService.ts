import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';

@Injectable()
export class GetListCategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  public async exec(): Promise<Category[]> {
    return this.categoryRepository.manager
      .getTreeRepository(Category)
      .findTrees({ depth: 3 });
  }
}
