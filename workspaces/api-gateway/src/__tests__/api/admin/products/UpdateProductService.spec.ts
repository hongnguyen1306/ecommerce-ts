import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsModule } from 'api/admin/products/product.module';
import { createTestingModule, mockDate } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { UpdateProductService } from 'api/admin/products/services/UpdateProductService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('ProductsService', () => {
  let dataSource: DataSource;
  let category: Category;
  let product: Product;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let updateProductService: UpdateProductService;

  const createCategoryDto: CreateCategoryDto = {
    name: categoriesSample.name,
    parentId: null,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [ProductsModule],
      entities: [Category, Product],
      providers: [CreateCategoryService, CheckCategoryExistedService],
      fakeTime: true,
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);
    updateProductService = module.get(UpdateProductService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);
    product = await createProductService.exec({
      categoryId: category.id,
      name: 'shirt',
    });
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE products_categories CASCADE');
    await QueryRunner.manager.query('TRUNCATE products CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('updateProductService', () => {
    describe('with valid key', () => {
      it('should return with product', async () => {
        const updateProduct = await updateProductService.exec({
          slug: product.slug,
          name: 'update',
        });

        const result = {
          id: product.id,
          name: 'update',
          slug: 'update',
          createdAt: mockDate,
          updatedAt: mockDate,
          deletedAt: null,
        };

        expect(updateProduct).toEqual(result);
      });
    });
  });
});
