import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';

describe('Task Management', () => {
  describe('when fetching tasks', () => {
    let mockTasksRepository: { findAll: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = { findAll: vi.fn() };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('returns paginated tasks when no search filter is provided', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task A',
          createdAt: new Date(),
          isCompleted: false,
          targetProgress: 100,
          currentProgress: 0,
          metric: '%',
          description: 'abc',
        },
        {
          id: 2,
          title: 'Task B',
          createdAt: new Date(),
          isCompleted: false,
          targetProgress: 100,
          currentProgress: 0,
          metric: '%',
          description: 'abc',
        },
        {
          id: 3,
          title: 'Task C',
          createdAt: new Date(),
          isCompleted: false,
          targetProgress: 100,
          currentProgress: 0,
          metric: '%',
          description: 'abc',
        },
      ];

      mockTasksRepository.findAll.mockResolvedValue(mockTasks);
      const result = await service.getAll(1, 3);

      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(3, 1, undefined);
      expect(result).toBe(mockTasks);
    });

    it('returns only tasks matching the search criteria', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task A',
          createdAt: new Date(),
          isCompleted: false,
          targetProgress: 100,
          currentProgress: 0,
          metric: '%',
          description: 'abc',
        },
      ];

      mockTasksRepository.findAll.mockResolvedValue(mockTasks);
      const result = await service.getAll(1, 3, 'Task A');

      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(3, 1, 'Task A');
      expect(result).toBe(mockTasks);
    });

    it('returns empty list when no tasks match the search', async () => {
      vi.mocked(mockTasksRepository.findAll)?.mockResolvedValue([]);
      const result = await service.getAll(1, 3, 'Task A');

      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(3, 1, 'Task A');
      expect(result).toEqual([]);
    });
  });

  describe('when creating a task', () => {
    let mockTasksRepository: { create: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = { create: vi.fn() };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('creates a new task successfully', async () => {
      const createTaskDto = {
        title: 'Task A',
        isCompleted: false,
        targetProgress: 100,
        currentProgress: 0,
        metric: '%',
        description: 'abc',
      };
      const createdTask = { ...createTaskDto, id: 1, createdAt: new Date() };

      mockTasksRepository.create.mockResolvedValue(createdTask);
      const result = await service.create(createTaskDto);

      expect(result).toEqual({ message: 'Created Successfully!', createdTask });
    });

    it('prevents creating a task when a task with the same title already exists', async () => {
      const createTaskDto = {
        title: 'Task A',
        isCompleted: false,
        targetProgress: 100,
        currentProgress: 0,
        metric: '%',
        description: 'abc',
      };
      const buildUniqueViolationError = () => {
        const error = new DrizzleQueryError('duplicate key', []);
        Object.assign(error, { cause: { code: '23505' } });
        return error;
      };

      mockTasksRepository.create.mockRejectedValue(buildUniqueViolationError());
      const act = () => service.create(createTaskDto);

      await expect(act()).rejects.toThrow(
        new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('when updating a task', () => {
    let mockTasksRepository: { update: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = { update: vi.fn() };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('updates task details and returns the updated task', async () => {
      const updateTaskDto = {
        title: 'Task A',
        currentProgress: 3,
        metric: '%',
        description: 'abc',
      };
      const updatedTask = {
        ...updateTaskDto,
        id: 1,
        targetProgress: 100,
        isCompleted: false,
        createdAt: new Date(),
      };

      mockTasksRepository.update.mockResolvedValue(updatedTask);
      const result = await service.update('1', updateTaskDto);

      expect(result).toEqual({ message: 'Updated Successfully!', updatedTask });
    });

    it('prevents updating a task to a title that already exists', async () => {
      const updateTaskDto = {
        title: 'Task A',
        isCompleted: false,
        targetProgress: 100,
        currentProgress: 0,
        metric: '%',
        description: 'abc',
      };
      const buildUniqueViolationError = () => {
        const error = new DrizzleQueryError('duplicate key', []);
        Object.assign(error, { cause: { code: '23505' } });
        return error;
      };

      mockTasksRepository.update.mockRejectedValue(buildUniqueViolationError());
      const act = () => service.update('1', updateTaskDto);

      await expect(act()).rejects.toThrow(
        new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('when removing a task', () => {
    let mockTasksRepository: { delete: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = { delete: vi.fn() };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('removes an existing task and confirms deletion', async () => {
      const deletedTask = {
        id: 1,
        title: 'Task A',
        createdAt: new Date(),
        isCompleted: false,
        targetProgress: 100,
        currentProgress: 0,
        metric: '%',
        description: 'abc',
      };
      mockTasksRepository.delete.mockResolvedValue(deletedTask);
      const result = await service.delete('1');

      expect(result).toEqual({ message: 'Deleted Successfully!', deletedTask });
    });

    it('reports an error when attempting to remove a task that does not exist', async () => {
      mockTasksRepository.delete.mockResolvedValue(null);
      const act = () => service.delete('1');

      await expect(act).rejects.toThrow(
        new NotFoundException('Task with given id not found!'),
      );
    });
  });
});
