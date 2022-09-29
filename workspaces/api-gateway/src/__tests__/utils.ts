import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TestingModule } from '@nestjs/testing';
import type {
  DynamicModule,
  INestApplication,
  ModuleMetadata,
} from '@nestjs/common';

import { createTypeOrmOptions } from 'typeOrm.config';
import { User } from 'database/models/user.entity';

export interface IModuleMetaData extends ModuleMetadata {
  entities?: Parameters<typeof TypeOrmModule['forFeature']>[0];
  useOrm?: boolean;
}

export const createTestingModule = async ({
  imports = [],
  controllers = [],
  providers = [],
  entities = [],
  useOrm = true,
}: IModuleMetaData): Promise<{
  module: TestingModule;
  app: INestApplication;
}> => {
  let dynamicModules: DynamicModule[] = [];

  if (useOrm) {
    dynamicModules = [
      TypeOrmModule.forRoot(createTypeOrmOptions()),
      TypeOrmModule.forFeature([...entities, User]),
    ];
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
  };
};
