import { Inject, Injectable } from '@nestjs/common';
import { CreateTasksDto } from './tasks-types';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { tasks } from './schema';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly tasks_Database: NodePgDatabase<typeof schema>,
  ) {}

  getAll() {
    return this.tasks_Database.query.tasks.findMany();
  }

  async create(createTaskDto: CreateTasksDto) {
    const [task] = await this.tasks_Database
      .insert(tasks)
      .values(createTaskDto)
      .returning();

    return task;
  }
}
