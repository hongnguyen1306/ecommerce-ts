import * as request from 'supertest';
import { DataSource } from 'typeorm';
import type { Mapper } from '@automapper/core';
import type { Repository } from 'typeorm';
import type { INestApplication } from '@nestjs/common';

import { Category } from 'database/models/category.entity';
import { CategoriesModule } from 'api/v1/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { V1Profile } from 'api/v1/v1.profile';
import { CategoryVM } from 'api/v1/categories/categories.vm';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let mapper: Mapper;
  let categoryRepository: Repository<Category>;
  let category: Category;

  beforeAll(async () => {
    const { module, app: appInstance } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product, ProductsCategories],
      providers: [V1Profile],
    });

    dataSource = module.get(DataSource);
    categoryRepository = module.get('CategoryRepository');

    mapper = module.get<Mapper>('automapper:nestjs:default');

    app = appInstance;
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  beforeEach(async () => {
    category = categoryRepository.create({
      name: 'electronics',
      slug: 'electronics',
      level: 0,
      parentId: null,
      children: [],
    });
    await categoryRepository.save(category);

    const category2 = categoryRepository.create({
      name: 'TV',
      slug: 'TV',
      level: 1,
      parentId: category.id,
      parent: category,
      children: [],
    });
    await categoryRepository.save(category2);

    category.children = [category2];
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET api/v1/categories', () => {
    it('return list categories', async () => {
      const resultMapping = await mapper.mapArrayAsync(
        [category],
        Category,
        CategoryVM,
      );

      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .set('Accept', 'application/json')
        .expect((response: request.Response) => {
          expect(response.body).toEqual(resultMapping);
        });
    });
  });
});
