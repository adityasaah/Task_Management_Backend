import { describe, vi, it, beforeEach, expect } from 'vitest';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  describe('getAll', () => {
    let mockTasksService: { getAll: ReturnType<typeof vi.fn> };
    let controller: TasksController;

    beforeEach(() => {
      vi.clearAllMocks();
      mockTasksService = { getAll: vi.fn() };
      controller = new TasksController(
        mockTasksService as unknown as TasksService,
      );
    });

    it('should call service with correct pagination args and title as undefined', async () => {
      mockTasksService.getAll.mockResolvedValue([]);
      await controller.getAll({ page: 1, pageSize: 5, title: undefined });
      expect(mockTasksService.getAll).toHaveBeenCalledWith(1, 5, undefined);
    });

    it('should return tasks array from service', async () => {
      const tasks = [
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
      mockTasksService.getAll.mockResolvedValue(tasks);
      const result = await controller.getAll({
        page: 1,
        pageSize: 3,
        title: undefined,
      });
      expect(result).toBe(tasks);
    });
  });
});
