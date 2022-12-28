import { createMap } from '@automapper/core';
import type { MappingProfile } from '@automapper/core';

import {
  CategoriesPagyMetadataVM,
  CategoriesPagyVM,
  CategoryDescendantVM,
  CategoryVM,
} from 'api/admin/categories/categories.vm';
import { Category } from 'database/models/category.entity';

export const categoriesProfile: MappingProfile = (mapper) => {
  createMap(mapper, Category, CategoryVM);
  createMap(mapper, Category, CategoryDescendantVM);
  createMap(mapper, CategoriesPagyMetadataVM, CategoriesPagyVM);
};
