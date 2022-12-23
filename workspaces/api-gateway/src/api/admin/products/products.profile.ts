import { createMap } from '@automapper/core';
import type { MappingProfile } from '@automapper/core';

import {
  ProductsCategoriesVM,
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/admin/products/products.vm';
import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';

export const productsProfile: MappingProfile = (mapper) => {
  createMap(mapper, Product, ProductVM);
  createMap(mapper, ProductsCategories, ProductsCategoriesVM);
  createMap(mapper, ProductsPagyMetadataVM, ProductsPagyVM);
};
