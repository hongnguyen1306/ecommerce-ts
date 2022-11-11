import { addProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { productProfile } from 'api/v1/products/product.profile';
import { categoryProfile } from 'api/v1/categories/categories.profile';

@Injectable()
export class V1Profile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      addProfile(mapper, productProfile);
      addProfile(mapper, categoryProfile);
    };
  }
}
