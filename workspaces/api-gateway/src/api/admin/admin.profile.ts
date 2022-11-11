import { addProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { categoryProfile } from 'api/admin/categories/category.profile';
import { productProfile } from 'api/admin/products/product.profile';

@Injectable()
export class AdminProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      addProfile(mapper, categoryProfile);
      addProfile(mapper, productProfile);
    };
  }
}
