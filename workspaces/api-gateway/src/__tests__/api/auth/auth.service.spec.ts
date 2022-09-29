import { compare, genSalt, hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';

import { User } from 'database/models/user.entity';
import { AuthService } from 'api/auth/auth.service';
import { AuthModule } from 'api/auth/auth.module';
import { createTestingModule } from '__tests__/utils';
import { userData } from '__tests__/seeds/user';
import type { AuthCredentialsDto } from 'api/auth/dto/auth-credential.dto';

describe('AuthSerice', () => {
  let authService: AuthService;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let user: User;

  const userDto: AuthCredentialsDto = {
    username: userData.username,
    password: userData.password,
  };

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [AuthModule],
      entities: [User],
    });

    userRepository = module.get('UserRepository');
    dataSource = module.get(DataSource);
    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
    jest.spyOn(jwtService, 'sign').mockImplementation(() => 'fakeToken');
  });

  beforeEach(async () => {
    const salt = await genSalt();
    const hashedPassword = await hash(userDto.password, salt);
    user = userRepository.create({
      username: userDto.username,
      password: hashedPassword,
    });
    await userRepository.save(user);
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await userRepository.clear();
    await dataSource.destroy();
  });

  describe('signUp', () => {
    it('should return user', async () => {
      const signUpDto: AuthCredentialsDto = {
        username: 'Signup',
        password: 'Signup1235',
      };

      const salt = await genSalt();
      const hashedPassword = await hash(signUpDto.password, salt);

      const userSignUp = await authService.signUp(signUpDto);

      expect(userSignUp.authToken).toEqual('fakeToken');
      expect(userSignUp.profile.username).toEqual(signUpDto.username);
      expect(compare(signUpDto.password, hashedPassword));
    });
  });

  describe('signIn', () => {
    it('should return user and authToken', () => {
      expect(authService.signIn(user)).toEqual({
        profile: user,
        authToken: 'fakeToken',
      });
    });
  });

  describe('getProfile', () => {
    it('should return profile', async () => {
      const profile = await authService.getProfile(userDto.username);
      expect(profile).toEqual(user);
    });
  });
});
