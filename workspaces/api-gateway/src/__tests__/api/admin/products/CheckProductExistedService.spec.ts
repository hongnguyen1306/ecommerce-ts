import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { ProductsModule } from 'api/admin/products/products.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { productSample } from '__tests__/seeds/product';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';
import type { CreateProductDto } from 'api/admin/products/products.dto';

describe('ProductsService', () => {
  let dataSource: DataSource;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let checkProductExistedService: CheckProductExistedService;
  let category: Category;
  let product: Product;
  let mockDate: Date;

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
    checkProductExistedService = module.get(CheckProductExistedService);
    createProductService = module.get(CreateProductService);
    createCategoryService = module.get(CreateCategoryService);

    mockDate = productSample.createdAt;
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate as unknown as string);
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

  describe('checkProductExisted', () => {
    describe('with valid name and column', () => {
      it('should return info category', async () => {
        const checkedProductExisted = await checkProductExistedService.exec(
          product.name,
          'name',
        );

        expect(checkedProductExisted).toEqual(true);
      });
    });
  });
});
