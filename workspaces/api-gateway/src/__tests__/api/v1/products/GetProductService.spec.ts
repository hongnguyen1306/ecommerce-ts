import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { ProductsModule } from 'api/v1/products/product.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { GetProductService } from 'api/v1/products/services/GetProductService';
import { productSample } from '__tests__/seeds/product';

describe('ProductsService', () => {
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let getProductService: GetProductService;
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
    getProductService = module.get(GetProductService);
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

  describe('getProductDetail', () => {
    describe('with valid key', () => {
      it('should return with product', async () => {
        const product2 = await getProductService.exec(product.slug);
        product.category = undefined;
        product2.category = undefined;

        expect(product2).toEqual(product);
      });
    });
  });
});
