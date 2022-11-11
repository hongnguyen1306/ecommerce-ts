import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let getCategoryByKeyService: GetCategoryByKeyService;
  let createCategoryService: CreateCategoryService;
  let category: Category;

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
    getCategoryByKeyService = module.get(GetCategoryByKeyService);
    createCategoryService = module.get(CreateCategoryService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getCategoryByKeyService', () => {
    describe('with valid key', () => {
      it('should return info category', async () => {
        const findProductByKey = await getCategoryByKeyService.exec(
          category.id,
        );

        expect(findProductByKey).toEqual(category);
      });
    });
  });
});
