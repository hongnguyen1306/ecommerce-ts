import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import { User } from 'database/models/user.entity';
import type { IAuthProps, IJwtPayload } from 'api/auth/auth.interface';

@Injectable()
export class SignInService {
  constructor(private jwtService: JwtService) {}

  exec(user: User): IAuthProps {
    const { username } = user;
    const payload: IJwtPayload = { username };
    return {
      profile: user,
      authToken: this.jwtService.sign(payload),
    };
  }
}
