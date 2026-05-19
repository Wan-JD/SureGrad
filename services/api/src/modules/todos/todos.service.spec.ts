import { BadRequestException, ConflictException } from '@nestjs/common';
import { PlansRepository } from '../plans/repositories/plans.repository';
import { TodoItemEntity } from '../../database/entities/todo-item.entity';
import { TodosRepository } from './repositories/todos.repository';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  const createTodosRepositoryMock = () =>
    ({
      findTodos: jest.fn(),
      createTodo: jest.fn(),
      saveTodo: jest.fn(),
      findTodoById: jest.fn(),
      countPendingTodosByDate: jest.fn(),
      removeTodo: jest.fn(),
    }) as unknown as jest.Mocked<TodosRepository>;

  const createPlansRepositoryMock = () =>
    ({
      findStudyPlanByIdForUser: jest.fn(),
      findWeeklyPlanByIdForUser: jest.fn(),
      findDailyPlanByIdForUser: jest.fn(),
    }) as unknown as jest.Mocked<PlansRepository>;

  it('returns todo summary and list data', async () => {
    const todosRepository = createTodosRepositoryMock();
    todosRepository.findTodos = jest.fn().mockResolvedValue({
      items: [
        {
          id: 'todo-1',
          studyPlanId: null,
          weeklyPlanId: null,
          dailyPlanId: null,
          subjectId: null,
          subject: null,
          title: 'Review words',
          description: null,
          dueDate: '2026-05-17',
          expectedMinutes: 30,
          priority: 'high',
          sourceType: 'manual',
          status: 'pending',
          completedAt: null,
          createdAt: new Date('2026-05-17T08:00:00.000Z'),
        },
      ],
      total: 1,
      summaryRows: [{ status: 'pending', count: '1' }],
    });

    const service = new TodosService(
      todosRepository,
      createPlansRepositoryMock(),
    );

    const result = await service.findAll('user-1', {
      date: '2026-05-17',
      page: 1,
      pageSize: 20,
    });

    expect(result.summary).toMatchObject({
      date: '2026-05-17',
      totalCount: 1,
      pendingCount: 1,
    });
    expect(result.items[0]).toMatchObject({
      todoItemId: 'todo-1',
      title: 'Review words',
    });
  });

  it('creates a todo after validating plan context', async () => {
    const todosRepository = createTodosRepositoryMock();
    const plansRepository = createPlansRepositoryMock();
    const createdTodo: TodoItemEntity = {
      id: 'todo-1',
      userId: 'user-1',
      studyPlanId: 'plan-1',
      weeklyPlanId: null,
      dailyPlanId: null,
      subjectId: null,
      subject: null,
      title: 'Finish reading',
      description: null,
      dueDate: '2026-05-17',
      expectedMinutes: 45,
      priority: 'medium',
      sourceType: 'manual',
      status: 'pending',
      completedAt: null,
      sortOrder: 0,
      createdAt: new Date('2026-05-17T08:00:00.000Z'),
      updatedAt: new Date('2026-05-17T08:00:00.000Z'),
      deletedAt: null,
    };
    plansRepository.findStudyPlanByIdForUser = jest.fn().mockResolvedValue({
      id: 'plan-1',
    });
    todosRepository.createTodo = jest.fn().mockReturnValue(createdTodo);
    todosRepository.saveTodo = jest
      .fn()
      .mockImplementation(
        (payload: Parameters<TodosRepository['saveTodo']>[0]) =>
          Promise.resolve(payload),
      );

    const service = new TodosService(todosRepository, plansRepository);
    const result = await service.create('user-1', {
      studyPlanId: 'plan-1',
      title: 'Finish reading',
      dueDate: '2026-05-17',
      expectedMinutes: 45,
    });

    expect(result).toEqual({
      todoItemId: 'todo-1',
      status: 'pending',
      sourceType: 'manual',
    });
  });

  it('rejects invalid create context', async () => {
    const service = new TodosService(
      createTodosRepositoryMock(),
      createPlansRepositoryMock(),
    );

    await expect(
      service.create('user-1', {
        studyPlanId: 'plan-1',
        title: 'Finish reading',
        dueDate: '2026-05-17',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates a todo', async () => {
    const todosRepository = createTodosRepositoryMock();
    todosRepository.findTodoById = jest.fn().mockResolvedValue({
      id: 'todo-1',
      userId: 'user-1',
      studyPlanId: null,
      weeklyPlanId: null,
      dailyPlanId: null,
      subjectId: null,
      title: 'Old title',
      description: null,
      dueDate: '2026-05-17',
      expectedMinutes: 20,
      priority: 'medium',
      sourceType: 'manual',
      status: 'pending',
      completedAt: null,
    });
    todosRepository.saveTodo = jest
      .fn()
      .mockImplementation(
        (payload: Parameters<TodosRepository['saveTodo']>[0]) =>
          Promise.resolve(payload),
      );

    const service = new TodosService(
      todosRepository,
      createPlansRepositoryMock(),
    );
    const result = await service.update('user-1', 'todo-1', {
      title: 'Updated title',
      priority: 'high',
    });

    expect(result).toMatchObject({
      todoItemId: 'todo-1',
      title: 'Updated title',
      priority: 'high',
    });
  });

  it('completes a todo and returns today pending count', async () => {
    const todosRepository = createTodosRepositoryMock();
    todosRepository.findTodoById = jest.fn().mockResolvedValue({
      id: 'todo-1',
      userId: 'user-1',
      dueDate: '2026-05-17',
      status: 'pending',
      completedAt: null,
    });
    todosRepository.saveTodo = jest
      .fn()
      .mockImplementation(
        (payload: Parameters<TodosRepository['saveTodo']>[0]) =>
          Promise.resolve(payload),
      );
    todosRepository.countPendingTodosByDate = jest.fn().mockResolvedValue(3);

    const service = new TodosService(
      todosRepository,
      createPlansRepositoryMock(),
    );
    const result = await service.complete('user-1', 'todo-1', {});

    expect(result.todoItemId).toBe('todo-1');
    expect(result.status).toBe('completed');
    expect(result.todayPendingCount).toBe(3);
  });

  it('rejects duplicate completion', async () => {
    const todosRepository = createTodosRepositoryMock();
    todosRepository.findTodoById = jest.fn().mockResolvedValue({
      id: 'todo-1',
      userId: 'user-1',
      status: 'completed',
    });

    const service = new TodosService(
      todosRepository,
      createPlansRepositoryMock(),
    );

    await expect(
      service.complete('user-1', 'todo-1', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
