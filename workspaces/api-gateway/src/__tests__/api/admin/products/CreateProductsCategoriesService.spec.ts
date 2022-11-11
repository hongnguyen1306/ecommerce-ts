import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { ProductsModule } from 'api/admin/products/product.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CreateCategoryDto } from 'api/admin/categories/categories.dto';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';

describe('ProductsService', () => {
  let productsRepository: Repository<Product>;
  let createCategoryService: CreateCategoryService;
  let createProductCategoryService: CreateProductCategoryService;
  let dataSource: DataSource;
  let category: Category;
  let product: Product;

  const createCategoryDto: CreateCategoryDto = {
    name: categoriesSample.name,
    parentId: null,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [ProductsModule],
      entities: [Category, Product, ProductsCategories],
      providers: [CreateCategoryService, CheckCategoryExistedService],
      fakeTime: true,
    });

    productsRepository = module.get('ProductRepository');
    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductCategoryService = module.get(CreateProductCategoryService);
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);

    product = productsRepository.create({
      name: 'shirt',
      category: category,
      slug: 'shirt',
    });
    await productsRepository.save(product);
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

  describe('createProCate', () => {
    describe('with valid productId and categoryId', () => {
      it('should return new list products-categories', async () => {
        const newProductCategory = await createProductCategoryService.exec({
          productId: product.id,
          categoryId: category.id,
        });

        expect(newProductCategory).toBeInstanceOf(Array);

        newProductCategory.map((item) => {
          expect(item.productId).toEqual(product.id),
            expect(item.categoryId).toEqual(category.id);
        });
      });
    });
  });
});
