import * as request from 'supertest';
import type { Mapper } from '@automapper/core';
import type { INestApplication } from '@nestjs/common';

import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/v1/products/products.vm';
import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { DataSource } from 'typeorm';
import { categoriesSample } from '__tests__/seeds/categories';
import { productSample } from '__tests__/seeds/product';
import { createTestingModule } from '__tests__/utils';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { V1Profile } from 'api/v1/v1.profile';
import { ProductsController } from 'api/v1/products/products.controller';
import { GetListProductsService } from 'api/v1/products/services/GetListProductsService';
import { GetProductService } from 'api/v1/products/services/GetProductService';

describe('ProductsController V1 (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let mapper: Mapper;
  let product: Product;
  let category: Category;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;

  beforeAll(async () => {
    const { module, app: appInstance } = await createTestingModule({
      entities: [Category, Product, ProductsCategories],
      providers: [
        CreateCategoryService,
        CreateProductService,
        CheckCategoryExistedService,
        CheckProductExistedService,
        CreateProductCategoryService,
        GetCategoryByKeyService,
        GetRelatedCategoriesService,
        GetProductService,
        GetListProductsService,
        V1Profile,
      ],
      controllers: [ProductsController],
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);

    mapper = module.get<Mapper>('automapper:nestjs:default');

    app = appInstance;
    app.setGlobalPrefix('api/v1');
    await app.init();
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
    await app.close();
  });

  describe('GET /api/v1/products?page=1&perpage=1', () => {
    describe('with product', () => {
      it('returns list products', async () => {
        const resultMapping = await mapper.mapAsync(
          { data: [product], total: 1 },
          ProductsPagyMetadataVM,
          ProductsPagyVM,
        );

        return request(app.getHttpServer())
          .get('/api/v1/products?page=1&perPage=1')
          .set('Accept', 'application/json')
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });

  describe('GET /api/v1/product/:slug', () => {
    describe('with product name', () => {
      it('returns info product', async () => {
        const resultMapping = await mapper.mapAsync(
          product,
          Product,
          ProductVM,
        );

        return request(app.getHttpServer())
          .get(`/api/v1/products/${product.slug}`)
          .set('Accept', 'application/json')
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });
});
