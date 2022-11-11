import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { createSlug } from 'utils';
import { Category } from 'database/models/category.entity';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

@Injectable()
export class CreateCategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private checkedCategoryExistedService: CheckCategoryExistedService,
  ) {}

  public async exec({ name, parentId }: CreateCategoryDto): Promise<Category> {
    let findParent: Category;
    let level = 0;
    if (parentId) {
      findParent = await this.categoryRepository.findOneBy({
        id: parentId,
      });
    }

    if (findParent) {
      level = findParent.level + 1;
    }

    const newCategory = this.categoryRepository.create({
      name,
      slug: await createSlug(
        {
          name,
          columnName: 'slug',
        },
        this.checkedCategoryExistedService.exec.bind(
          this.checkedCategoryExistedService,
        ),
      ),
      level,
      parentId,
      parent: findParent,
    });

    try {
      return this.categoryRepository.save(newCategory);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
