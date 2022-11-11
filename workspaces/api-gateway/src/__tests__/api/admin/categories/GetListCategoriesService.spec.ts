import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { GetListCategoriesService } from 'api/admin/categories/services/GetListCategoriesService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let getListCategoriesService: GetListCategoriesService;
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
    getListCategoriesService = module.get(GetListCategoriesService);
    createCategoryService = module.get(CreateCategoryService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);

    await createCategoryService.exec({
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

  describe('getListCategories', () => {
    describe('with valid slug', () => {
      it('should return list categories', async () => {
        const listCategories = await getListCategoriesService.exec({
          page: 1,
          perPage: 1,
        });

        expect(listCategories).toEqual([[category], 2]);
      });
    });
  });
});
