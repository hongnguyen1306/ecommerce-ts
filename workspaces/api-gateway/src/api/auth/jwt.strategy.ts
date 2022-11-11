import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

import { GetProfileService } from 'api/auth/services/GetProfileService';
import type { User } from 'database/models/user.entity';
import type { IJwtPayload } from 'api/auth/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private getProfileService: GetProfileService) {
    super({
      secretOrKey: process.env.SECRET_KEY_JWT,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.getProfileService.exec(username);
    if (!user) {
      throw new UnauthorizedException('Please check your login credentials');
    }
    return user;
  }
}
