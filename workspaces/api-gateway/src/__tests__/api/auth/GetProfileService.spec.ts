import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';

import { User } from 'database/models/user.entity';
import { AuthModule } from 'api/auth/auth.module';
import { createTestingModule, createUser } from '__tests__/utils';
import { userData } from '__tests__/seeds/user';
import { GetProfileService } from 'api/auth/services/GetProfileService';

describe('GetProfileService', () => {
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let getProfileService: GetProfileService;
  let user: User;
  let jwtService: JwtService;

  beforeAll(async () => {
    const { module } = await createTestingModule({
      imports: [AuthModule],
      entities: [User],
    });

    userRepository = module.get('UserRepository');
    dataSource = module.get(DataSource);
    jwtService = module.get(JwtService);
    getProfileService = module.get(GetProfileService);
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

  describe('getProfile', () => {
    it('should return profile', async () => {
      const profile = await getProfileService.exec(userData.username);
      expect(profile).toEqual(user);
    });
  });
});
