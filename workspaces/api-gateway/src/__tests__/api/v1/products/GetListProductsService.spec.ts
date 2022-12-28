import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { GetListProductsService } from 'api/v1/products/services/GetListProductsService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { productSample } from '__tests__/seeds/product';
import { ProductsModule } from 'api/v1/products/products.module';

describe('ProductsService', () => {
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let getListProductsService: GetListProductsService;
  let dataSource: DataSource;
  let category: Category;
  let product: Product;

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [ProductsModule],
      entities: [Category, Product, ProductsCategories],
      providers: [
        CreateCategoryService,
        CheckCategoryExistedService,
        CreateProductService,
        CheckCategoryExistedService,
        CheckProductExistedService,
        CreateProductCategoryService,
        GetCategoryByKeyService,
        GetRelatedCategoriesService,
      ],
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);
    getListProductsService = module.get(GetListProductsService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec({
      name: categoriesSample.name,
      parentId: null,
    });
    product = await createProductService.exec({
      categoryId: category.id,
      name: productSample.name,
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
