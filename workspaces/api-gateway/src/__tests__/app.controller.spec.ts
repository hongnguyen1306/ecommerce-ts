import * as request from 'supertest';
import type { INestApplication } from '@nestjs/common';

import { AppController } from 'app.controller';
import { createTestingModule } from '__tests__/utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: appInstance } = await createTestingModule({
      controllers: [AppController],
      useOrm: false,
    });
    app = appInstance;
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('returns ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect('OK');
    });
  });
});
