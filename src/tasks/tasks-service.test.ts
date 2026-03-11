import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service';
import { TasksRepository } from './tasks.repository';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';

describe('tasksService', () => {
  describe('getAll', () => {
    let mockTasksRepository: { findAll: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = {
        findAll: vi.fn(),
      };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('should return the array of tasks according to provided page and pageSize and title of tasks as undefined', async () => {
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

    it('should return the array of tasks according to provided page and pageSize and title of tasks', async () => {
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

    it('should return empty array of tasks according to provided page and pageSize and title of tasks which is not found', async () => {
      const mockTasks = [];

      vi.mocked(mockTasksRepository.findAll)?.mockResolvedValue(mockTasks);

      const result = await service.getAll(1, 3, 'Task A');

      expect(mockTasksRepository.findAll).toHaveBeenCalledWith(3, 1, 'Task A');
      expect(result).toBe(mockTasks);
    });
  });

  describe('create', () => {
    let mockTasksRepository: { create: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = {
        create: vi.fn(),
      };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('should insert task and return createdTask with proper json response', async () => {
      const createTaskDto = {
        title: 'Task A',
        isCompleted: false,
        targetProgress: 100,
        currentProgress: 0,
        metric: '%',
        description: 'abc',
      };

      const createdTask = {
        ...createTaskDto,
        id: 1,
        createdAt: new Date(),
      };

      mockTasksRepository.create.mockResolvedValue(createdTask);

      const result = await service.create(createTaskDto);

      // Assert
      expect(result).toEqual({ message: 'Created Successfully!', createdTask });
    });
    it('should throw HttpException when same title is tried to add', async () => {
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
      const uniqueViolationError = buildUniqueViolationError();
      mockTasksRepository.create.mockRejectedValue(uniqueViolationError); // 👈 rejected not resolved

      const act = () => service.create(createTaskDto);

      await expect(act()).rejects.toThrow(
        new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('update', () => {
    let mockTasksRepository: { update: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = {
        update: vi.fn(),
      };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('should update task with partial field and return updatedTask with proper json response', async () => {
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

      // Assert
      expect(result).toEqual({ message: 'Updated Successfully!', updatedTask });
    });
    it('should throw HttpException when same title is tried to add as update', async () => {
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
      const uniqueViolationError = buildUniqueViolationError();
      mockTasksRepository.update.mockRejectedValue(uniqueViolationError);

      const act = () => service.update('1', updateTaskDto);

      await expect(act()).rejects.toThrow(
        new HttpException(
          'Title with same name already exists',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('delete', () => {
    let mockTasksRepository: { delete: ReturnType<typeof vi.fn> };
    let service: TasksService;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksRepository = { delete: vi.fn() };
      service = new TasksService(
        mockTasksRepository as unknown as TasksRepository,
      );
    });

    it('should return success message with deleted task', async () => {
      // Arrange
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

    it('should throw NotFoundException when task is not found', async () => {
      mockTasksRepository.delete.mockResolvedValue(null);

      const act = () => service.delete('1');

      await expect(act).rejects.toThrow(
        new NotFoundException('Task with given id not found!'),
      );
    });
  });
});
