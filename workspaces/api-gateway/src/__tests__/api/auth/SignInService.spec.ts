import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';

import { User } from 'database/models/user.entity';
import { AuthModule } from 'api/auth/auth.module';
import { createTestingModule, createUser } from '__tests__/utils';
import { SignInService } from 'api/auth/services/SignInService';

describe('SignInService', () => {
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let signInService: SignInService;
  let user: User;

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [AuthModule],
      entities: [User],
    });

    userRepository = module.get('UserRepository');
    dataSource = module.get(DataSource);
    signInService = module.get(SignInService);
    jwtService = module.get(JwtService);
    jest.spyOn(jwtService, 'sign').mockImplementation(() => 'fakeToken');
  });
  beforeEach(async () => {
    user = (
      await createUser({
        repository: userRepository,
        jwtService,
      })
    ).profile;
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('signIn', () => {
    it('should return user and authToken', () => {
      expect(signInService.exec(user)).toEqual({
        profile: user,
        authToken: 'fakeToken',
      });
    });
  });
});
