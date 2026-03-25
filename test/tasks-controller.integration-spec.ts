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
import { eq } from 'drizzle-orm';

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


  async function createTasks(count: number, titlePrefix = 'Task') {
    const tasksToInsert = Array.from({ length: count }, (_, i) => ({
      title: `${titlePrefix} ${i + 1}`,
      description: `Description ${i + 1}`,
      targetProgress: 100,
      currentProgress: 0,
      metric: 'percent',
      isCompleted: false,
    }));
    await db.insert(tasks).values(tasksToInsert);
  }

  describe('should fetch all tasks', () => {
    it('returns an empty list when no tasks exist', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
    });

    it('should return correct number of tasks based on given pageSize', async () => {
      await createTasks(10);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ pageSize: 3 })
        .expect(200);

      expect(response.body).toHaveLength(3);
    });


    it('should return correct tasks for given page number', async () => {
      await createTasks(10);


      const page2 = await request(app.getHttpServer())
        .get('/tasks')
        .query({ page: 2, pageSize: 4 })
        .expect(200);


      expect(page2.body).toHaveLength(4);

      expect(page2.body).toEqual([
        { id: expect.any(Number), 'title': 'Task 5', 'description': 'Description 5', 'isCompleted': false, 'targetProgress': 100, 'currentProgress': 0, 'metric': 'percent', 'createdAt': expect.any(String) },
        { id: expect.any(Number), 'title': 'Task 6', 'description': 'Description 6', 'isCompleted': false, 'targetProgress': 100, 'currentProgress': 0, 'metric': 'percent', 'createdAt': expect.any(String) },
        { id: expect.any(Number), 'title': 'Task 7', 'description': 'Description 7', 'isCompleted': false, 'targetProgress': 100, 'currentProgress': 0, 'metric': 'percent', 'createdAt': expect.any(String) },
        { id: expect.any(Number), 'title': 'Task 8', 'description': 'Description 8', 'isCompleted': false, 'targetProgress': 100, 'currentProgress': 0, 'metric': 'percent', 'createdAt': expect.any(String) },
      ]);
    });

    it('should return empty array when page exceeds total tasks', async () => {
      await createTasks(3);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ page: 99, pageSize: 5 })
        .expect(200);

      expect(response.body).toHaveLength(0);
    });

    it('should return tasks matching title filter', async () => {
      await db.insert(tasks).values([
        { title: 'Buy groceries', description: 'desc', targetProgress: 100, currentProgress: 0, metric: 'percent', isCompleted: false },
        { title: 'Buy milk', description: 'desc', targetProgress: 100, currentProgress: 0, metric: 'percent', isCompleted: false },
        { title: 'Clean house', description: 'desc', targetProgress: 100, currentProgress: 0, metric: 'percent', isCompleted: false },
      ]);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ title: 'buy' })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.every((t) => t.title.includes('Buy'))).toBe(true);
    });

    it('should return empty array when no tasks match title filter', async () => {
      await db.insert(tasks).values([
        { title: 'Buy groceries', description: 'desc' },
      ]);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .query({ title: 'xyz_no_match' })
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  })


  describe('should create tasks', () => {

    function buildValidTask(overrides = {}) {
      return {
        title: 'Learn NestJS',
        description: 'Complete NestJS course',
        targetProgress: 100,
        currentProgress: 0,
        metric: 'percent',
        ...overrides,
      };
    }

    function createTask(body: object) {
      return request(app.getHttpServer())
        .post('/tasks')
        .send(body);
    }


    it('should return 201 with message and created task', async () => {
      const validTask = buildValidTask();

      const response = await createTask(validTask).expect(201);

      expect(response.body.message).toBe('Created Successfully!');
      expect(response.body.createdTask).toEqual({ ...validTask, id: expect.any(Number), createdAt: expect.any(String), isCompleted: false });
    });


    it('should prevent creation when any required field is missing', async () => {
      const taskWithoutTitle = buildValidTask({ title: undefined });

      await createTask(taskWithoutTitle).expect(400);
    });

    it('should prevent creation when task with same title already exists', async () => {
      const validTask = buildValidTask({ title: 'Duplicate Title' });

      await createTask(validTask);

      const response = await createTask(validTask).expect(400);

      expect(response.body.message).toBe('Title with same name already exists');
    });


  })


  describe("should update tasks", () => {

    function buildValidTask(overrides = {}) {
      return {
        title: 'Learn NestJS',
        description: 'Complete NestJS course',
        targetProgress: 100,
        currentProgress: 0,
        metric: 'percent',
        ...overrides,
      };
    }

    async function seedTask(overrides = {}) {
      const [task] = await db
        .insert(tasks)
        .values(buildValidTask(overrides))
        .returning();
      return task;
    }

    function updateTask(id: number, body: object) {
      return request(app.getHttpServer())
        .put(`/tasks/${id}`)
        .send(body);
    }

    it('should update and return message and updated task', async () => {
      const existingTask = await seedTask();

      const response = await updateTask(existingTask.id, {
        title: 'Updated Title',
      }).expect(200);

      expect(response.body.message).toBe('Updated Successfully!');
      expect(response.body.updatedTask.title).toBe('Updated Title');
    });


    it('should update only the provided fields', async () => {
      const existingTask = await seedTask();

      await updateTask(existingTask.id, {
        title: 'New Title',
      }).expect(200);

      const [dbTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, existingTask.id));

      expect(dbTask.title).toBe('New Title');

      expect(dbTask.description).toBe(existingTask.description);
      expect(dbTask.metric).toBe(existingTask.metric);
      expect(dbTask.targetProgress).toBe(existingTask.targetProgress);
      expect(dbTask.currentProgress).toBe(existingTask.currentProgress);
    });


    it('should not update when title or description is empty string', async () => {
      const existingTask = await seedTask();

      await updateTask(existingTask.id, {
        title: '',
      }).expect(400);

      await updateTask(existingTask.id, {
        description: '',
      }).expect(400);
    });


    it('should not update when targetProgress or currentProgress is invalid', async () => {
      const existingTask = await seedTask();

      await updateTask(existingTask.id, {
        targetProgress: -1,
      }).expect(400);

      await updateTask(existingTask.id, {
        currentProgress: -1,
      }).expect(400);
    });


    it('should not update with unknown fields provided', async () => {
      const existingTask = await seedTask();

      await updateTask(existingTask.id, {
        unknownField: 'value',
      }).expect(400);
    });


    it('should return 400 when updating to an already existing title', async () => {
      await seedTask({ title: 'Existing Title' });
      const secondTask = await seedTask({ title: 'Second Title' });

      const response = await updateTask(secondTask.id, {
        title: 'Existing Title',
      }).expect(400);

      expect(response.body.message).toBe('Title with same name already exists');
    });

  })

  describe("should delete tasks", () => {
    function buildValidTask(overrides = {}) {
      return {
        title: 'Learn NestJS',
        description: 'Complete NestJS course',
        targetProgress: 100,
        currentProgress: 0,
        metric: 'percent',
        ...overrides,
      };
    }

    async function seedTask(overrides = {}) {
      const [task] = await db
        .insert(tasks)
        .values(buildValidTask(overrides))
        .returning();
      return task;
    }

    function deleteTask(id: number) {
      return request(app.getHttpServer()).delete(`/tasks/${id}`);
    }


    it('should delete successfully and return message and deleted task', async () => {
      const existingTask = await seedTask();

      const response = await deleteTask(existingTask.id).expect(200);

      expect(response.body.message).toBe('Deleted Successfully!');
      expect(response.body.deletedTask).toMatchObject({
        title: existingTask.title,
        description: existingTask.description,
      });
    });


    it('should not delete anything when given task does not exist', async () => {
      const nonExistentId = 99999;

      const response = await deleteTask(nonExistentId).expect(404);

      expect(response.body.message).toBe('Task with given id not found!');
    });

  })

});






// pullume