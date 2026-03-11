import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTasksDto,
  GetTasksQueryDto,
  UpdateTasksDto,
} from './tasks-types';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAll(
    @Query(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    getTasksQueryDto: GetTasksQueryDto,
  ) {
    const { page, pageSize, title } = getTasksQueryDto;
    return this.tasksService.getAll(page, pageSize, title);
  }

  @Post()
  create(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    createTaskDto: CreateTasksDto,
  ) {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  update(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    updateTaskDto: UpdateTasksDto,
    @Param('id') id: string,
  ) {
    return this.tasksService.update(updateTaskDto, id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
