import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTasksDto, UpdateTasksDto } from './tasks-types';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { tasks } from './schema';
import { DrizzleQueryError, eq } from 'drizzle-orm';

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
    try {
      let isCompleted = false;
      if (createTaskDto.currentProgress === createTaskDto.targetProgress) {
        isCompleted = true;
      }
      const [createdTask] = await this.tasks_Database
        .insert(tasks)
        .values({ ...createTaskDto, isCompleted })
        .returning();

      return { message: 'Created Successfully!', createdTask };
    } catch (error) {
      if (
        error instanceof DrizzleQueryError &&
        typeof error.cause === 'object' &&
        'code' in error.cause &&
        error.cause.code === '23505'
      ) {
        throw new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      // console.log(error.constructor.name);
      throw error;
    }
  }

  async update(updateTaskDto: UpdateTasksDto, id: string) {
    try {
      const [updatedTask] = await this.tasks_Database
        .update(tasks)
        .set({ ...updateTaskDto })
        .where(eq(tasks.id, Number(id)))
        .returning();

      return { message: 'Updated Successfully!', updatedTask };
    } catch (error) {
      if (
        error instanceof DrizzleQueryError &&
        typeof error.cause === 'object' &&
        'code' in error.cause &&
        error.cause.code === '23505'
      ) {
        throw new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      // console.log(error.constructor.name);
      throw error;
    }
  }

  async delete(id: string) {
    const [deletedTask] = await this.tasks_Database
      .delete(tasks)
      .where(eq(tasks.id, Number(id)))
      .returning();

    if (!deletedTask) {
      throw new NotFoundException('Task with given id not found!');
    }

    return { message: 'Deleted Successfully!', deletedTask };
  }
}
