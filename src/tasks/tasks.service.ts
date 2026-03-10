import { Inject, Injectable } from '@nestjs/common';
import { CreateTasksDto, UpdateTasksDto } from './tasks-types';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { tasks } from './schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly tasks_Database: NodePgDatabase<typeof schema>,
  ) {}

  getAll(page: number = 1, pageSize: number = 5, title?: string) {
    return this.tasks_Database.query.tasks.findMany({
      where: title
        ? (tasks, { ilike }) => ilike(tasks.title, `%${title}%`)
        : undefined,
      orderBy: (tasks, { asc }) => asc(tasks.createdAt),
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });
  }

  async create(createTaskDto: CreateTasksDto) {
    const [task] = await this.tasks_Database
      .insert(tasks)
      .values(createTaskDto)
      .returning();

    return task;
  }

  async update(updateTaskDto: UpdateTasksDto, id: string) {
    const [task] = await this.tasks_Database
      .update(tasks)
      .set({ ...updateTaskDto })
      .where(eq(tasks.id, Number(id)))
      .returning();

    return task;
  }

  async delete(id: string) {
    const [task] = await this.tasks_Database
      .delete(tasks)
      .where(eq(tasks.id, Number(id)))
      .returning();

    return task;
  }
}
