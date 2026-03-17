import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DATABASE_CONNECTION } from '../src/database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { AppModule } from '../src/app.module';
import * as taskSchema from '../src/tasks/schema';
import { tasks } from '../src/tasks/schema';

describe('TasksController', () => {
  let app: INestApplication;
  let db: NodePgDatabase<typeof taskSchema>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    db = module.get(DATABASE_CONNECTION);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.delete(tasks);
  });

  it('returns 200 with empty array when no tasks exist', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });
});
