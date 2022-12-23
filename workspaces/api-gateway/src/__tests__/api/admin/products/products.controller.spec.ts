import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';
import type { INestApplication } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { ProductsModule } from 'api/admin/products/products.module';
import { createTestingModule, createUser } from '__tests__/utils';
import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { productSample } from '__tests__/seeds/product';
import { categoriesSample } from '__tests__/seeds/categories';
import { CheckCategoryExistedService } from 'api/admin/categories/services/CheckCategoryExistedService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/admin/products/products.vm';
import { User } from 'database/models/user.entity';
import { SignUpService } from 'api/auth/services/SignUpService';
import { JwtStrategy } from 'api/auth/jwt.strategy';
import { GetProfileService } from 'api/auth/services/GetProfileService';
import { AdminProfile } from 'api/admin/admin.profile';
import type { IAuthProps } from 'api/auth/auth.interface';
import type { CreateProductDto } from 'api/admin/products/products.dto';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let mapper: Mapper;
  let userRepository: Repository<User>;
  let product: Product;
  let category: Category;
  let createCategoryService: CreateCategoryService;
  let createProductService: CreateProductService;
  let userAuth: IAuthProps;
  let jwtService: JwtService;

  const createProductDto: CreateProductDto = {
    categoryId: null,
    name: productSample.name,
  };

  const createCategoryDto: CreateCategoryDto = {
    name: categoriesSample.name,
    parentId: null,
  };

  beforeAll(async () => {
    const { module, app: appInstance } = await createTestingModule({
      imports: [
        ProductsModule,
        JwtModule.register({
          secret: process.env.SECRET_KEY_JWT,
          signOptions: {
            expiresIn: parseInt(process.env.EXPIRES_TIME_JWT),
          },
        }),
      ],
      entities: [Category, Product, ProductsCategories, User],
      providers: [
        CreateCategoryService,
        CheckCategoryExistedService,
        GetRelatedCategoriesService,
        GetCategoryByKeyService,
        JwtStrategy,
        SignUpService,
        GetProfileService,
        AdminProfile,
      ],
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);
    jwtService = module.get(JwtService);
    userRepository = module.get('UserRepository');

    mapper = module.get<Mapper>('automapper:nestjs:default');

    app = appInstance;
    app.setGlobalPrefix('admin');
    await app.init();
  });

  beforeEach(async () => {
    userAuth = await createUser({ repository: userRepository, jwtService });

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
    await QueryRunner.manager.query('TRUNCATE users CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /admin/products', () => {
    describe('with valid product name', () => {
      it('returns product', async () => {
        const resultMapping = await mapper.mapAsync(
          product,
          Product,
          ProductVM,
        );

        return request(app.getHttpServer())
          .post('/admin/products')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .send(createProductDto)
          .expect((response: request.Response) => {
            response.body.id = product.id;
            response.body.slug = product.slug;

            expect(response.body).toEqual(resultMapping);
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('with empty product name or category id', () => {
      it('raises error', async () => {
        return request(app.getHttpServer())
          .post('/admin/products')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .send({ categoryId: '', productName: 'pro2' })
          .expect(() => {
            expect({
              statusCode: 400,
              message: 'categoryName should not be empty',
            });
          });
      });
    });
  });

  describe('GET /admin/products', () => {
    describe('with product name', () => {
      it('returns info product', async () => {
        const resultMapping = await mapper.mapAsync(
          { data: [product], total: 1 },
          ProductsPagyMetadataVM,
          ProductsPagyVM,
        );
        return request(app.getHttpServer())
          .get(`/admin/products?name=${product.name}&page=${1}&perpage=${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });

  describe('GET /admin/products/:slug', () => {
    describe('with valid product slug', () => {
      it('returns info product', async () => {
        const resultMapping = await mapper.mapAsync(
          product,
          Product,
          ProductVM,
        );
        return request(app.getHttpServer())
          .get(`/admin/products/${product.slug}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });

  describe('PUT /admin/products/:slug', () => {
    describe('with valid product slug', () => {
      it('returns info product after update', async () => {
        const result = {
          id: product.id,
          name: 'update',
          slug: 'update',
        };

        return request(app.getHttpServer())
          .put(`/admin/products/${product.slug}`)
          .send({ name: 'update' })
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(result);
          });
      });
    });
  });

  describe('DELETE /admin/products/:slug', () => {
    describe('with valid product slug', () => {
      it('returns "Deleted!"', async () => {
        return request(app.getHttpServer())
          .delete(`/admin/products/${product.slug}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.text).toEqual('Deleted!');
          });
      });
    });
  });
});
