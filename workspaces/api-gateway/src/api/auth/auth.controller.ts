import { MapInterceptor } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from 'database/models/user.entity';
import { AuthVM, ProfileVM, SignInVM } from 'api/auth/auth.vm';
import { AuthService } from 'api/auth/auth.service';
import { AuthCredentialsDto } from 'api/auth/dto/auth-credential.dto';
import type { IRequest } from 'interface';
import type { IAuthProps } from 'api/auth/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UseInterceptors(MapInterceptor(SignInVM, AuthVM))
  async signUp(
    @Body()
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<IAuthProps> {
    return this.authService.signUp(authCredentialsDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('signin')
  @UseInterceptors(MapInterceptor(SignInVM, AuthVM))
  signIn(@Request() req: IRequest): IAuthProps {
    return this.authService.signIn(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @UseInterceptors(MapInterceptor(User, ProfileVM))
  userProfile(@Request() req: IRequest): User {
    return req.user;
  }
}
