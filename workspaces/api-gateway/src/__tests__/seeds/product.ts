import { categoriesSample } from '__tests__/seeds/categories';
import type { Product } from 'database/models/product.entity';
import { mockDate } from '__tests__/utils';

export const productSample: Product = {
  id: '2',
  name: 'Product 1',
  slug: 'Product-1',
  categoryId: categoriesSample.id,
  createdAt: mockDate,
  updatedAt: mockDate,
  deletedAt: null,
};
