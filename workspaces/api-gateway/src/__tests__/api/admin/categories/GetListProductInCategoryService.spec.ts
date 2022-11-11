import { DataSource } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { GetListProductInCategoryService } from 'api/admin/categories/services/GetListProductsInCategoryService';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let getListProductInCategoryService: GetListProductInCategoryService;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let category: Category;
  let category2: Category;

  const createCategoryDto: CreateCategoryDto = {
    name: 'electronics',
    parentId: null,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product, ProductsCategories],
      providers: [
        CreateProductService,
        CreateProductCategoryService,
        CheckProductExistedService,
        GetCategoryByKeyService,
        GetRelatedCategoriesService,
      ],
    });

    dataSource = module.get(DataSource);
    createProductService = module.get(CreateProductService);
    createCategoryService = module.get(CreateCategoryService);
    getListProductInCategoryService = module.get(
      GetListProductInCategoryService,
    );
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);

    category2 = await createCategoryService.exec({
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

  describe('getListProductInCategoryService', () => {
    describe('with valid name and column', () => {
      it('should return info category', async () => {
        const product1 = await createProductService.exec({
          name: 'test product',
          categoryId: category.id,
        });

        const product2 = await createProductService.exec({
          name: 'test product',
          categoryId: category2.id,
        });

        const listProducts = await getListProductInCategoryService.exec(
          category2.slug,
        );

        const listCategoriesId = [category2.id, category.id];
        const listProductsId = [product2.id, product1.id];

        expect(listProducts).toBeInstanceOf(Array);
        listProducts.map((item, index) => {
          expect(item.categoryId).toEqual(listCategoriesId[index]);
          expect(item.productId).toEqual(listProductsId[index]);
        });
      });
    });
  });
});
