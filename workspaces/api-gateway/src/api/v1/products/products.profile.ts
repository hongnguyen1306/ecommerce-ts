import { createMap } from '@automapper/core';
import type { MappingProfile } from '@automapper/core';

import { Product } from 'database/models/product.entity';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/v1/products/products.vm';

export const productsProfile: MappingProfile = (mapper) => {
  createMap(mapper, Product, ProductVM);
  createMap(mapper, ProductsPagyMetadataVM, ProductsPagyVM);
};
