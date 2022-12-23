import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { UpdateCategoryService } from 'api/admin/categories/services/UpdateCategoryService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let updateCategoryService: UpdateCategoryService;
  let createCategoryService: CreateCategoryService;
  let category: Category;

  const createCategoryDto: CreateCategoryDto = {
    name: 'electronics',
    parentId: null,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product, ProductsCategories],
      providers: [CheckProductExistedService, GetCategoryByKeyService],
      fakeTime: true,
    });

    dataSource = module.get(DataSource);
    updateCategoryService = module.get(UpdateCategoryService);
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

  describe('updateCategoryService', () => {
    describe('update parentId', () => {
      it('should return info category', async () => {
        const updateCategory = await updateCategoryService.exec({
          slug: category.slug,
          name: 'update',
        });

        const result = {
          id: category.id,
          name: 'update',
          slug: 'update',
          level: 0,
          updatedAt: new Date(),
          createdAt: new Date(),
        };

        expect(updateCategory).toEqual(result);
      });
    });
  });
});
