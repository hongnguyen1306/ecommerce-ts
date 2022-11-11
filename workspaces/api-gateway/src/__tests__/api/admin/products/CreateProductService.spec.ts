import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { ProductsModule } from 'api/admin/products/product.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { productSample } from '__tests__/seeds/product';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CreateCategoryDto } from 'api/admin/categories/categories.dto';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import type { CreateProductDto } from 'api/admin/products/products.dto';

describe('ProductsService', () => {
  let productsRepository: Repository<Product>;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let dataSource: DataSource;
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
    const { module, mockDate: dateInstance } = await createTestingModule({
      imports: [ProductsModule],
      entities: [Category, Product, ProductsCategories],
      providers: [CreateCategoryService, CheckCategoryExistedService],
      fakeTime: true,
    });

    productsRepository = module.get('ProductRepository');
    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);

    mockDate = dateInstance;
  });

  beforeEach(async () => {
    category = await createCategoryService.exec(createCategoryDto);

    productSample.categoryId = category.id;
    productSample.category = category;
    createProductDto.categoryId = category.id;

    product = productsRepository.create({
      name: createProductDto.name,
      category: category,
      slug: createProductDto.name,
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

  describe('createProduct', () => {
    describe('with existed slug', () => {
      it('should return with timestamp slug', async () => {
        const newProduct = await createProductService.exec(createProductDto);

        newProduct.id = product.id;
        product.slug = `${product.slug}-${mockDate.getTime()}`;

        expect(newProduct).toEqual(product);
      });
    });

    describe('with new slug', () => {
      it('should return with new slug', async () => {
        const newProduct = await createProductService.exec({
          name: productSample.name,
          categoryId: productSample.categoryId,
        });

        newProduct.id = productSample.id;

        expect(newProduct).toEqual(productSample);
      });
    });
  });
});
