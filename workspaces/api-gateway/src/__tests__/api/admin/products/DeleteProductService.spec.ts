import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsModule } from 'api/admin/products/products.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { DeleteProductService } from 'api/admin/products/services/DeleteProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';
import type { CreateProductDto } from 'api/admin/products/products.dto';

describe('ProductsService', () => {
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let deleteProductService: DeleteProductService;
  let dataSource: DataSource;
  let category: Category;
  let product: Product;

  const createProductDto: CreateProductDto = {
    categoryId: '1',
    name: 'shirt',
  };

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
    deleteProductService = module.get(DeleteProductService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);
    createProductDto.categoryId = category.id;
    product = await createProductService.exec(createProductDto);
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

  describe('deleteProductService', () => {
    describe('with valid key', () => {
      it('should return with product', async () => {
        const result = await deleteProductService.exec(product.slug);

        expect(result).toEqual('Deleted!');
      });
    });
  });
});
