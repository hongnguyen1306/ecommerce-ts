import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { User } from 'database/models/user.entity';
import { AuthVM, ProfileVM, SignInVM } from 'api/auth/auth.vm';

@Injectable()
export class AuthProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, User, ProfileVM);
      createMap(mapper, SignInVM, AuthVM);
    };
  }
}
