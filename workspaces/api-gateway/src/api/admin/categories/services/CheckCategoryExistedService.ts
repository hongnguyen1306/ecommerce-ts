import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';

@Injectable()
export class CheckCategoryExistedService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  public async exec(name: string, column: string): Promise<boolean> {
    const findCategory = await this.categoryRepository.findOne({
      where: {
        [column]: name,
      },
    });

    return !!findCategory;
  }
}
