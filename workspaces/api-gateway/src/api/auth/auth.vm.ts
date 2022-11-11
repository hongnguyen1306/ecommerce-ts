import { AutoMap } from '@automapper/classes';

import { User } from 'database/models/user.entity';

export class ProfileVM {
  @AutoMap()
  id: string;

  @AutoMap()
  email: string;

  @AutoMap()
  username: string;
}

export class SignInVM {
  @AutoMap(() => User)
  profile: User;

  @AutoMap()
  authToken: string;
}

export class AuthVM {
  @AutoMap(() => ProfileVM)
  profile: ProfileVM;

  @AutoMap()
  authToken: string;
}
