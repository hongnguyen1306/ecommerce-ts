import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { ProductsModule } from 'api/admin/products/products.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { GetListProductsService } from 'api/admin/products/services/GetListProductsService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';
import type { CreateProductDto } from 'api/admin/products/products.dto';

describe('ProductsService', () => {
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let getListProductsService: GetListProductsService;
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
      entities: [Category, Product, ProductsCategories],
      providers: [CreateCategoryService, CheckCategoryExistedService],
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);
    getListProductsService = module.get(GetListProductsService);
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

  describe('getListProducts', () => {
    describe('with valid key', () => {
      it('should return with product', async () => {
        const product2 = await createProductService.exec({
          name: 'shirt 2',
          categoryId: category.id,
        });
        product.category = undefined;
        product2.category = undefined;

        const result = await getListProductsService.exec({
          page: 1,
          perPage: 1,
        });

        expect(result).toEqual([[product2], 2]);
      });
    });
  });
});
