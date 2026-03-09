import { Body, Controller, Get, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTasksDto } from './tasks-types';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAll() {
    return this.tasksService.getAll();
  }

  @Post()
  create(@Body() createTaskDto: CreateTasksDto) {
    return this.tasksService.create(createTaskDto);
  }
}
