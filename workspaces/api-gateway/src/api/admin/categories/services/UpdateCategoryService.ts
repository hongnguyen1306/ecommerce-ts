import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import { createSlug } from 'utils';
import { Category } from 'database/models/category.entity';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { getlistCategoryIds } from 'api/admin/categories/helper';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import type { UpdateCategoryDto } from 'api/admin/categories/categories.dto';

@Injectable()
export class UpdateCategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private dataSource: DataSource,
    private checkedCategoryExistedService: CheckCategoryExistedService,
    private getRelatedCategoriesService: GetRelatedCategoriesService,
  ) {}

  public async exec({
    slug,
    name,
    parentId,
    ...data
  }: UpdateCategoryDto): Promise<Category> {
    const QueryRunner = this.dataSource.createQueryRunner();

    const category = await this.categoryRepository.findOne({
      where: {
        slug,
      },
    });

    if (name && category.name !== name) {
      slug = await createSlug(
        { name: name, columnName: 'slug' },
        this.checkedCategoryExistedService.exec.bind(
          this.checkedCategoryExistedService,
        ),
      );
    }

    if (!category) {
      throw new NotFoundException(`Not found ${slug}`);
    }

    if (parentId) {
      const listCategories = await this.getRelatedCategoriesService.exec({
        key: parentId,
        option: 'Ancestors',
      });

      const listIdCategories = getlistCategoryIds(listCategories);

      const level = listIdCategories.length;

      if (category.parentId !== null) {
        await QueryRunner.manager.query(
          `DELETE FROM categories_closure WHERE id_ancestor = '${category.parentId}' AND id_descendant <> '${category.parentId}'`,
        );
      }

      Object.assign(category, {
        name,
        slug,
        parentId,
        level,
        ...data,
      });

      await this.categoryRepository.save(category);

      const resultUpdate = listIdCategories.map((idCategory: string) =>
        QueryRunner.manager.query(
          `INSERT INTO categories_closure VALUES ('${idCategory}', '${category.id}')`,
        ),
      );
      await Promise.all(resultUpdate);
    } else {
      Object.assign(category, {
        name,
        slug,
        parentId,
        ...data,
      });

      await this.categoryRepository.save(category);
    }

    return category;
  }
}
