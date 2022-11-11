import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { RouterModule } from '@nestjs/core';
import type { Routes } from '@nestjs/core';

import { createTypeOrmOptions } from 'typeOrm.config';
import { AppController } from 'app.controller';
import { AuthModule, authRoutes } from 'api/auth/auth.module';
import { AdminModule, adminRoutes } from 'api/admin/admin.module';
import { V1Module, v1Routes } from 'api/v1/v1.module';

const routes: Routes = [authRoutes, adminRoutes, v1Routes];

@Module({
  imports: [
    RouterModule.register(routes),
    TypeOrmModule.forRoot(createTypeOrmOptions()),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    AuthModule,
    AdminModule,
    V1Module,
  ],
  controllers: [AppController],
})
export class AppModule {}
