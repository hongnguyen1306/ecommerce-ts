import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { RouterModule } from '@nestjs/core';
import type { Routes } from '@nestjs/core';

import { createTypeOrmOptions } from 'typeOrm.config';
import { AppController } from 'app.controller';
import { AuthModule, authRoutes } from 'api/auth/auth.module';

const routes: Routes = [authRoutes];

@Module({
  imports: [
    RouterModule.register(routes),
    TypeOrmModule.forRoot(createTypeOrmOptions()),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
