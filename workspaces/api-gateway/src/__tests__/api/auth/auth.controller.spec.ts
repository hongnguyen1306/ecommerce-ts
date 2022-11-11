import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';
import type { INestApplication } from '@nestjs/common';
import type { Mapper } from '@automapper/core';

import { User } from 'database/models/user.entity';
import { userData } from '__tests__/seeds/user';
import { createTestingModule } from '__tests__/utils';
import { AuthVM, ProfileVM, SignInVM } from 'api/auth/auth.vm';
import { AuthModule } from 'api/auth/auth.module';
import { SignUpService } from 'api/auth/services/SignUpService';
import type { AuthCredentialsDto } from 'api/auth/dto/auth-credential.dto';
import type { IAuthProps } from 'api/auth/auth.interface';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let dataSource: DataSource;
  let mapper: Mapper;
  let jwtService: JwtService;
  let signUpService: SignUpService;
  let userAuth: IAuthProps;

  const userDto: AuthCredentialsDto = {
    username: userData.username,
    password: userData.password,
  };

  beforeAll(async () => {
    const { module, app: appInstance } = await createTestingModule({
      imports: [AuthModule],
      entities: [User],
    });

    userRepository = module.get('UserRepository');
    dataSource = module.get(DataSource);
    jwtService = module.get(JwtService);
    signUpService = module.get(SignUpService);

    mapper = module.get<Mapper>('automapper:nestjs:default');

    app = appInstance;
    app.setGlobalPrefix('api');
    await app.init();
  });

  beforeEach(async () => {
    userAuth = await signUpService.exec(userDto);
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /api/auth/signup', () => {
    describe('with valid username and password', () => {
      it('returns profile & authToken', async () => {
        const signUpDto: AuthCredentialsDto = {
          username: 'Signup',
          password: 'Signup1235',
        };

        jest
          .spyOn(jwtService, 'sign')
          .mockImplementationOnce(() => 'fakeToken');

        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send(signUpDto)
          .expect((response: request.Response) => {
            expect(response.body.authToken).toEqual('fakeToken');
            expect(response.body.profile.username).toEqual(signUpDto.username);
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('with already existed username', () => {
      it('raises error', async () => {
        return request(app.getHttpServer())
          .post('/api/auth/signup')
          .set('Accept', 'application/json')
          .send(userDto)
          .expect((response: request.Response) => {
            expect(response.body.message).toEqual('Username already exist');
          })
          .expect(HttpStatus.CONFLICT);
      });
    });
  });

  describe('POST /api/auth/signin', () => {
    describe('with valid username', () => {
      it('returns profile & authToken, ', async () => {
        const resultMapping = await mapper.mapAsync(userAuth, SignInVM, AuthVM);

        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .set('Accept', 'application/json')
          .send(userDto)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          })
          .expect(HttpStatus.CREATED);
      });
    });

    describe('with invalid username', () => {
      it('raises error', async () => {
        const falseDto: AuthCredentialsDto = {
          username: 'hdhd',
          password: 'jhahhsd1235',
        };

        return request(app.getHttpServer())
          .post('/api/auth/signin')
          .send(falseDto)
          .expect((response: request.Response) => {
            expect(response.body.message).toEqual(
              `There is no user under username ${falseDto.username}`,
            );
          })
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('GET /api/auth/profile', () => {
    describe('with valid token', () => {
      it('returns user profile ', async () => {
        const { profile, authToken } = userAuth;

        const resultMapping = await mapper.mapAsync(profile, User, ProfileVM);

        return request(app.getHttpServer())
          .get('/api/auth/profile')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${authToken}`)
          .expect((response: request.Response) => {
            expect(response.body).toEqual(resultMapping);
          })
          .expect(HttpStatus.OK);
      });
    });

    describe('with expired token', () => {
      it('raises unauthorized error', () => {
        return request(app.getHttpServer())
          .get('/api/auth/profile')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer fakeToken123`)
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });
});
