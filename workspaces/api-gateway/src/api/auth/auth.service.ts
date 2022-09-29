import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import type { Repository } from 'typeorm';

import { User } from 'database/models/user.entity';
import type { AuthCredentialsDto } from 'api/auth/dto/auth-credential.dto';
import type { IAuthProps, IJwtPayload } from 'api/auth/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<IAuthProps> {
    const { username, password } = authCredentialsDto;
    const payload: IJwtPayload = { username };
    const salt = await genSalt();
    const hashedPassword = await hash(password, salt);
    const user = this.userRepository.create({
      username: username,
      password: hashedPassword,
    });
    try {
      await this.userRepository.save(user);
      return {
        profile: user,
        authToken: this.jwtService.sign(payload),
      };
    } catch (error) {
      if (error['code'] === '23505') {
        throw new ConflictException('Username already exist');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  signIn(user: User): IAuthProps {
    const { username } = user;
    const payload: IJwtPayload = { username };
    return {
      profile: user,
      authToken: this.jwtService.sign(payload),
    };
  }

  async getProfile(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      throw new NotFoundException(
        `There is no user under username ${username}`,
      );
    }

    return user;
  }
}
