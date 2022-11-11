import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DynamicModule,
  INestApplication,
  ModuleMetadata,
} from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { TestingModule } from '@nestjs/testing';

import { createTypeOrmOptions } from 'typeOrm.config';
import { User } from 'database/models/user.entity';
import { Repository } from 'typeorm';
import { genSalt, hash } from 'bcrypt';
import { userData } from '__tests__/seeds/user';
import type { IAuthProps, IJwtPayload } from 'api/auth/auth.interface';

export const mockDate = new Date();

interface ICreateUserParams {
  repository: Repository<User>;
  jwtService: JwtService;
}

export interface IModuleMetaData extends ModuleMetadata {
  entities?: Parameters<typeof TypeOrmModule['forFeature']>[0];
  useOrm?: boolean;
  fakeTime?: boolean;
}

export const createTestingModule = async ({
  imports = [],
  controllers = [],
  providers = [],
  entities = [],
  useOrm = true,
  fakeTime = false,
}: IModuleMetaData): Promise<{
  module: TestingModule;
  app: INestApplication;
  mockDate: Date;
}> => {
  let dynamicModules: DynamicModule[] = [];

  if (useOrm) {
    dynamicModules = [
      TypeOrmModule.forRoot(createTypeOrmOptions()),
      TypeOrmModule.forFeature([...entities]),
    ];
  }

  if (fakeTime) {
    jest
      .spyOn(global, 'Date')
      .mockImplementation(() => mockDate as unknown as string);
  }

  const testingModule = await Test.createTestingModule({
    imports: [
      ...dynamicModules,
      AutomapperModule.forRoot({
        strategyInitializer: classes(),
      }),
      ...imports,
    ],
    controllers,
    providers,
  }).compile();

  const app = testingModule.createNestApplication();

  return {
    module: testingModule,
    app,
    mockDate,
  };
};

export const createUser = async ({
  repository,
  jwtService,
}: ICreateUserParams): Promise<IAuthProps> => {
  const salt = await genSalt();
  const hashedPassword = await hash(userData.password, salt);
  const user: User = repository.create({
    username: userData.username,
    password: hashedPassword,
    role: userData.role,
  });
  await repository.save(user);
  const payload: IJwtPayload = { username: user.username };

  return {
    profile: user,
    authToken: jwtService.sign(payload),
  };
};
