import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { createTestingModule } from '__tests__/utils';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let category: Category;
  let checkCategoryExistedService: CheckCategoryExistedService;
  let createCategoryService: CreateCategoryService;

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
    checkCategoryExistedService = module.get(CheckCategoryExistedService);
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

  describe('checkCategoryExisted', () => {
    describe('with valid name and column', () => {
      it('should return info category', async () => {
        const checkedCategoryExisted = await checkCategoryExistedService.exec(
          category.name,
          'name',
        );

        expect(checkedCategoryExisted).toEqual(true);
      });
    });
  });
});
