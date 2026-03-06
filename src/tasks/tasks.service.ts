import { Injectable } from '@nestjs/common';
import { Tasks } from './tasks-types';

@Injectable()
export class TasksService {
  tasks: Tasks[] = [
    {
      id: 1,
      title: 'Learn Nest',
      description: 'Follow all the steps to learn it',
      isCompleted: false,
    },
  ];

  getAll() {
    return this.tasks;
  }
}
