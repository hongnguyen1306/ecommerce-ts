import { DataSource } from 'typeorm';
import type { Repository } from 'typeorm';

import { Category } from 'database/models/category.entity';
import { Product } from 'database/models/product.entity';
import { CategoriesModule } from 'api/admin/categories/categories.module';
import { createTestingModule } from '__tests__/utils';
import { categoriesSample } from '__tests__/seeds/categories';
import { CreateCategoryService } from 'api/admin/categories/services/CreateCategoryService';
import type { CreateCategoryDto } from 'api/admin/categories/categories.dto';

describe('CategoriesService', () => {
  let mockDate: Date;
  let dataSource: DataSource;
  let category: Category;
  let categoriesRepository: Repository<Category>;
  let createCategoryService: CreateCategoryService;

  const createCategoryDto: CreateCategoryDto = {
    name: 'electronics',
    parentId: null,
  };

  beforeAll(async () => {
    const { module, mockDate: dateInstance } = await createTestingModule({
      imports: [CategoriesModule],
      entities: [Category, Product],
      fakeTime: true,
    });

    mockDate = dateInstance;
    dataSource = module.get(DataSource);
    categoriesRepository = module.get('CategoryRepository');
    createCategoryService = module.get(CreateCategoryService);
  });

  beforeEach(async () => {
    category = categoriesRepository.create({
      name: createCategoryDto.name,
      slug: createCategoryDto.name,
      level: 0,
      parentId: null,
    });
    await categoriesRepository.save(category);
  });

  afterEach(async () => {
    const QueryRunner = dataSource.createQueryRunner();

    await QueryRunner.manager.query('TRUNCATE categories_closure CASCADE');
    await QueryRunner.manager.query('TRUNCATE categories CASCADE');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('createCategory', () => {
    describe('with existed slug', () => {
      it('should return category with timestamp slug', async () => {
        const newCategory = await createCategoryService.exec(createCategoryDto);

        category.slug = `${category.slug}-${mockDate.getTime()}`;
        newCategory.id = category.id;

        expect(newCategory).toEqual(category);
      });
    });

    describe('with new slug', () => {
      it('should return category with new slug', async () => {
        const newCategory = await createCategoryService.exec({
          name: categoriesSample.name,
          parentId: categoriesSample.parentId,
        });

        newCategory.id = categoriesSample.id;

        expect(newCategory).toEqual(categoriesSample);
      });
    });
  });
});
