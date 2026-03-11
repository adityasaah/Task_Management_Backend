import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTasksDto, UpdateTasksDto } from './tasks-types';
import { isUniqueViolation, TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    // @Inject(DATABASE_CONNECTION)
    // private readonly tasks_Database: NodePgDatabase<typeof schema>,
    private readonly tasksRepository: TasksRepository,
  ) {}

  getAll(page: number, pageSize: number, title?: string) {
    return this.tasksRepository.findAll(pageSize, page, title);
  }

  private handleTitleDuplicateError(error: unknown): never {
    if (isUniqueViolation(error)) {
      throw new HttpException(
        'Title with same name already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    throw error;
  }
  async create(createTaskDto: CreateTasksDto) {
    try {
      const createdTask = await this.tasksRepository.create(createTaskDto);
      return { message: 'Created Successfully!', createdTask };
    } catch (error) {
      this.handleTitleDuplicateError(error);
    }
  }

  async update(id: string, updateTaskDto: UpdateTasksDto) {
    try {
      const updatedTask = await this.tasksRepository.update(
        Number(id),
        updateTaskDto,
      );
      return { message: 'Updated Successfully!', updatedTask };
    } catch (error) {
      return this.handleTitleDuplicateError(error);
    }
  }

  async delete(id: string) {
    const deletedTask = await this.tasksRepository.delete(Number(id));

    if (!deletedTask) {
      throw new NotFoundException('Task with given id not found!');
    }

    return { message: 'Deleted Successfully!', deletedTask };
  }
}
