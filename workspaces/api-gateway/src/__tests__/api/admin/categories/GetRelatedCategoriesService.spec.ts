import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let getRelatedCategoriesService: GetRelatedCategoriesService;
  let createCategoryService: CreateCategoryService;
  let category: Category;
  let category2: Category;

  const createCategoryDto: CreateCategoryDto = {
    name: 'electronics',
    parentId: null,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product],
    });

    dataSource = module.get(DataSource);
    getRelatedCategoriesService = module.get(GetRelatedCategoriesService);
    createCategoryService = module.get(CreateCategoryService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);

    category2 = await createCategoryService.exec({
      name: createCategoryDto.name,
      parentId: category.id,
    });
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getRelatedCategories', () => {
    describe('with valid slug', () => {
      it('should return info category and descendant categories', async () => {
        const findCategoryDescendants = await getRelatedCategoriesService.exec({
          key: category.slug,
          option: 'Descendants',
        });

        category.children = [category2];
        category2.parent = undefined;
        category2.children = [];

        expect(findCategoryDescendants).toEqual(category);
      });
    });
  });
});
