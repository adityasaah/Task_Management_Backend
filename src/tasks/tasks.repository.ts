import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { tasks } from './schema';
import { CreateTasksDto, UpdateTasksDto } from './tasks-types';

const UNIQUE_VIOLATION_CODE = '23505';

export const isUniqueViolation = (error: unknown): boolean => {
  return (
    error instanceof DrizzleQueryError &&
    typeof error.cause === 'object' &&
    error.cause !== null &&
    'code' in error.cause &&
    error.cause.code === UNIQUE_VIOLATION_CODE
  );
};

@Injectable()
export class TasksRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly tasks_Database: NodePgDatabase<typeof schema>,
  ) {}

  private buildTitleFilter(title?: string) {
    if (!title) return undefined;
    return (tasks, { ilike }) => ilike(tasks.title, `%${title}%`);
  }

  private orderByCreatedAtAscending = (tasks, { asc }) => asc(tasks.createdAt);

  private calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  findAll(pageSize: number, page: number, title?: string) {
    return this.tasks_Database.query.tasks.findMany({
      where: this.buildTitleFilter(title),
      orderBy: this.orderByCreatedAtAscending,
      limit: pageSize,
      offset: this.calculateOffset(page, pageSize),
    });
  }

  async create(createTaskDto: CreateTasksDto) {
    const [createdTask] = await this.tasks_Database
      .insert(tasks)
      .values({
        ...createTaskDto,
        isCompleted: this.isTaskCompleted(createTaskDto),
      })
      .returning();

    return createdTask;
  }

  private isTaskCompleted(createTaskDto: CreateTasksDto): boolean {
    return createTaskDto.currentProgress === createTaskDto.targetProgress;
  }

  async update(id: number, updateTaskDto: UpdateTasksDto) {
    const [updatedTask] = await this.tasks_Database
      .update(tasks)
      .set(updateTaskDto)
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask;
  }

  async delete(id: number) {
    const [deletedTask] = await this.tasks_Database
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    return deletedTask ?? null;
  }
}
