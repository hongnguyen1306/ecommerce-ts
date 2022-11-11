import type { Category } from 'database/models/category.entity';
import { mockDate } from '__tests__/utils';

export const categoriesSample: Category = {
  id: '1',
  name: 'clothes',
  slug: 'clothes',
  level: 0,
  createdAt: mockDate,
  updatedAt: mockDate,
};
