import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import type { DataSourceOptions } from 'typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function createTypeOrmOptions(): TypeOrmModuleOptions {
  return {
    migrationsTableName: 'migrations',
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    namingStrategy: new SnakeNamingStrategy(),
    entities: [`${__dirname}/src/database/models/*{.ts,.js}`],
    autoLoadEntities: true,
    synchronize: false,
    migrations: [`${__dirname}/database/migrations/*{.ts,.js}`],
  };
}

export default new DataSource(createTypeOrmOptions() as DataSourceOptions);
