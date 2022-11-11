import { createMap } from '@automapper/core';
import type { MappingProfile } from '@automapper/core';

import { Category } from 'database/models/category.entity';
import {
  CategoriesPagyMetadataVM,
  CategoriesPagyVM,
  CategoryDescendantVM,
  CategoryVM,
} from 'api/v1/categories/categories.vm';

export const categoryProfile: MappingProfile = (mapper) => {
  createMap(mapper, Category, CategoryVM);
  createMap(mapper, Category, CategoryDescendantVM);
  createMap(mapper, CategoriesPagyMetadataVM, CategoriesPagyVM);
};
