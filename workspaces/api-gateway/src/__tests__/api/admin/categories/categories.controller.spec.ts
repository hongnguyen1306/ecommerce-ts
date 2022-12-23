import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import type { INestApplication } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { Mapper } from '@automapper/core';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule, createUser } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import { GetListProductInCategoryService } from 'api/admin/categories/services/GetListProductsInCategoryService';
import { CreateProductService } from 'api/admin/products/services/CreateProductService';
import { CheckProductExistedService } from 'api/admin/products/services/CheckProductExistedService';
import { CreateProductCategoryService } from 'api/admin/products/services/CreateProductCategoryService';
import { GetRelatedCategoriesService } from 'api/admin/categories/services/GetRelatedCategoriesService';
import { GetCategoryByKeyService } from 'api/admin/categories/services/GetCategoryByKeyService';
import { ProductsCategoriesVM } from 'api/admin/products/products.vm';
import {
  CategoriesPagyMetadataVM,
  CategoriesPagyVM,
  CategoryDescendantVM,
  CategoryVM,
} from 'api/admin/categories/categories.vm';
import { User } from 'database/models/user.entity';
import { SignUpService } from 'api/auth/services/SignUpService';
import { JwtStrategy } from 'api/auth/jwt.strategy';
import { GetProfileService } from 'api/auth/services/GetProfileService';
import { AdminProfile } from 'api/admin/admin.profile';
import type { IAuthProps } from 'api/auth/auth.interface';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let mapper: Mapper;
  let userRepository: Repository<User>;
  let userAuth: IAuthProps;
  let category: Category;
  let createCategoryService: CreateCategoryService;
  let getListProductInCategoryService: GetListProductInCategoryService;
  let getRelatedCategoriesService: GetRelatedCategoriesService;
  let createProductService: CreateProductService;
  let jwtService: JwtService;

  const createCategoryDto: CreateCategoryDto = {
    name: categoriesSample.name,
    parentId: null,
  };

  beforeAll(async () => {
    const { module, app: appInstance } = await createTestingModule({
      imports: [
        CategoriesModule,
        JwtModule.register({
          secret: process.env.SECRET_KEY_JWT,
          signOptions: {
            expiresIn: parseInt(process.env.EXPIRES_TIME_JWT),
          },
        }),
      ],
      entities: [Category, Product, ProductsCategories, User],
      providers: [
        CreateProductService,
        CheckProductExistedService,
        CreateProductCategoryService,
        GetCategoryByKeyService,
        GetRelatedCategoriesService,
        AdminProfile,
        JwtStrategy,
        SignUpService,
        GetProfileService,
      ],
    });

    dataSource = module.get(DataSource);
    createCategoryService = module.get(CreateCategoryService);
    createProductService = module.get(CreateProductService);
    getListProductInCategoryService = module.get(
      GetListProductInCategoryService,
    );
    getRelatedCategoriesService = module.get(GetRelatedCategoriesService);
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
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
    await QueryRunner.manager.query('TRUNCATE users CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /admin/categories', () => {
    describe('with valid category name', () => {
      it('returns category', async () => {
        const resultMapping = await mapper.mapAsync(
          category,
          Category,
          CategoryVM,
        );

        return request(app.getHttpServer())
          .post('/admin/categories')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .send(createCategoryDto)
          .expect((response: request.Response) => {
            response.body.id = category.id;
            response.body.slug = category.slug;
            expect(response.body).toEqual(resultMapping);
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('with empty category name', () => {
      it('raises error', async () => {
        return request(app.getHttpServer())
          .post('/admin/categories')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .send({ name: '', parentId: null })
          .expect(() => {
            expect({
              statusCode: 400,
              message: 'name should not be empty',
            });
          });
      });
    });
  });

  describe('GET /admin/categories', () => {
    describe('with valid category slug', () => {
      it('returns list categories', async () => {
        const resultMapping = await mapper.mapAsync(
          { data: [category], total: 1 },
          CategoriesPagyMetadataVM,
          CategoriesPagyVM,
        );

        return request(app.getHttpServer())
          .get(`/admin/categories?name=${category.name}&page=${1}&perpage=${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });

  describe('GET /admin/categories/:slug', () => {
    describe('with valid category slug', () => {
      it('returns info category', async () => {
        const resultMapping = await mapper.mapAsync(
          category,
          Category,
          CategoryDescendantVM,
        );

        return request(app.getHttpServer())
          .get(`/admin/categories/${category.slug}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });

    describe('with invalid category slug', () => {
      it('raises error', async () => {
        return request(app.getHttpServer())
          .get(`/admin/categories/123`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect(() => {
            expect({
              statusCode: 404,
              message: `Not found 123`,
            });
          });
      });
    });
  });

  describe('GET /admin/categories/:slug/products', () => {
    describe('with valid category slug', () => {
      it('returns list products in category', async () => {
        await createProductService.exec({
          name: 'product1',
          categoryId: category.id,
        });

        const listProducts = await getListProductInCategoryService.exec(
          category.slug,
        );

        const resultMapping = await mapper.mapArrayAsync(
          listProducts,
          ProductsCategories,
          ProductsCategoriesVM,
        );

        return request(app.getHttpServer())
          .get(`/admin/categories/${category.slug}/products`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
            expect(response.body).toBeInstanceOf(Array);
          });
      });
    });
  });

  describe('GET /admin/categories/:slug/descendants', () => {
    describe('with valid category slug', () => {
      it('returns descendant category', async () => {
        const listCategories = await getRelatedCategoriesService.exec({
          key: category.slug,
          option: 'Descendants',
        });

        const resultMapping = await mapper.mapAsync(
          listCategories,
          Category,
          CategoryDescendantVM,
        );

        return request(app.getHttpServer())
          .get(`/admin/categories/${category.slug}/descendants`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          });
      });
    });
  });

  describe('PUT /admin/categories/:slug', () => {
    describe('with valid category slug', () => {
      it('returns info category after update', async () => {
        const result = {
          id: category.id,
          name: 'update',
          slug: 'update',
          level: 0,
        };

        return request(app.getHttpServer())
          .put(`/admin/categories/${category.slug}`)
          .send({ name: 'update' })
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${userAuth.authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(result);
          });
      });
    });
  });
});
