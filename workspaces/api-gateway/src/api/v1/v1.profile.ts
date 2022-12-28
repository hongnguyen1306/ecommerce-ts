import { addProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { productsProfile } from 'api/v1/products/products.profile';
import { categoriesProfile } from 'api/v1/categories/categories.profile';

@Injectable()
export class V1Profile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      addProfile(mapper, productsProfile);
      addProfile(mapper, categoriesProfile);
    };
  }
}
