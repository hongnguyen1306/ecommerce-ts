import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/v1/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { GetListCategoriesService } from 'api/v1/categories/services/GetListCategoriesService';
import { ProductsCategories } from 'database/models/productsCategories.entity';

describe('CategoriesService', () => {
  let dataSource: DataSource;
  let getListCategoriesService: GetListCategoriesService;
  let categoryRepository: Repository<Category>;
  let category: Category;

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product, ProductsCategories],
    });

    dataSource = module.get(DataSource);
    categoryRepository = module.get('CategoryRepository');
    getListCategoriesService = module.get(GetListCategoriesService);
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
      children: [],
    });

    await categoryRepository.save(category2);
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getListCategories', () => {
    describe('with valid slug', () => {
      it('should return list categories', async () => {
        const listCategories = await getListCategoriesService.exec();
        expect(listCategories).toEqual([category]);
      });
    });
  });
});
