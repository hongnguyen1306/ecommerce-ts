import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { checkPageNumber } from 'utils';
import { Category } from 'database/models/category.entity';
import type { PagyDto } from 'dto';

@Injectable()
export class GetListCategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  public async exec({ page, perPage }: PagyDto): Promise<[Category[], number]> {
    return this.categoryRepository.findAndCount({
      order: { name: 'DESC' },
      take: perPage,
      skip: checkPageNumber({ page, perPage }),
    });
  }
}
