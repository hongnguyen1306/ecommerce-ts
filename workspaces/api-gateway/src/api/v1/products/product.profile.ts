import { createMap } from '@automapper/core';
import type { MappingProfile } from '@automapper/core';

import { Product } from 'database/models/product.entity';
import {
  ProductsPagyMetadataVM,
  ProductsPagyVM,
  ProductVM,
} from 'api/v1/products/product.vm';

export const productProfile: MappingProfile = (mapper) => {
  createMap(mapper, Product, ProductVM);
  createMap(mapper, ProductsPagyMetadataVM, ProductsPagyVM);
};
