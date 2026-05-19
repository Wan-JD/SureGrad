import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getTodayDate } from '../../common/utils/date.util';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { PlansRepository } from '../plans/repositories/plans.repository';
import { TodosRepository } from './repositories/todos.repository';

@Injectable()
export class TodosService {
  constructor(
    private readonly todosRepository: TodosRepository,
    private readonly plansRepository: PlansRepository,
  ) {}

  async findAll(userId: string, query: QueryTodosDto) {
    this.assertAllowedSort(query.sortBy);

    const effectiveDate = query.date ?? getTodayDate();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const result = await this.todosRepository.findTodos({
      userId,
      date: effectiveDate,
      status: query.status,
      subjectId: query.subjectId,
      sourceType: query.sourceType,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      page,
      pageSize,
    });

    const summary = {
      date: effectiveDate,
      totalCount: result.summaryRows.reduce(
        (acc, row) => acc + Number(row.count),
        0,
      ),
      pendingCount: this.getSummaryCount(result.summaryRows, 'pending'),
      completedCount: this.getSummaryCount(result.summaryRows, 'completed'),
      cancelledCount: this.getSummaryCount(result.summaryRows, 'cancelled'),
    };

    return {
      summary,
      items: result.items.map((todo) => ({
        todoItemId: todo.id,
        studyPlanId: todo.studyPlanId,
        weeklyPlanId: todo.weeklyPlanId,
        dailyPlanId: todo.dailyPlanId,
        subjectId: todo.subjectId,
        subjectName: todo.subject?.name ?? null,
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        expectedMinutes: todo.expectedMinutes,
        priority: todo.priority,
        sourceType: todo.sourceType,
        status: todo.status,
        completedAt: todo.completedAt?.toISOString() ?? null,
        createdAt: todo.createdAt.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        total: result.total,
        hasMore: page * pageSize < result.total,
      },
    };
  }

  async create(userId: string, dto: CreateTodoDto) {
    await this.validatePlanContext(userId, dto);

    const todo = this.todosRepository.createTodo({
      userId,
      studyPlanId: dto.studyPlanId ?? null,
      weeklyPlanId: dto.weeklyPlanId ?? null,
      dailyPlanId: dto.dailyPlanId ?? null,
      subjectId: dto.subjectId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      dueDate: dto.dueDate.slice(0, 10),
      expectedMinutes: dto.expectedMinutes ?? 0,
      priority: dto.priority ?? 'medium',
      sourceType: 'manual',
      status: 'pending',
      completedAt: null,
      sortOrder: 0,
    });

    const savedTodo = await this.todosRepository.saveTodo(todo);

    return {
      todoItemId: savedTodo.id,
      status: savedTodo.status,
      sourceType: savedTodo.sourceType,
    };
  }

  async update(userId: string, todoItemId: string, dto: UpdateTodoDto) {
    const todo = await this.todosRepository.findTodoById(todoItemId);
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (dto.title !== undefined) {
      todo.title = dto.title;
    }

    if (dto.description !== undefined) {
      todo.description = dto.description;
    }

    if (dto.dueDate !== undefined) {
      todo.dueDate = dto.dueDate.slice(0, 10);
    }

    if (dto.subjectId !== undefined) {
      todo.subjectId = dto.subjectId;
    }

    if (dto.expectedMinutes !== undefined) {
      todo.expectedMinutes = dto.expectedMinutes ?? 0;
    }

    if (dto.priority !== undefined) {
      todo.priority = dto.priority;
    }

    if (dto.status !== undefined) {
      todo.status = dto.status;
      todo.completedAt = null;
    }

    const savedTodo = await this.todosRepository.saveTodo(todo);
    return {
      todoItemId: savedTodo.id,
      studyPlanId: savedTodo.studyPlanId,
      weeklyPlanId: savedTodo.weeklyPlanId,
      dailyPlanId: savedTodo.dailyPlanId,
      subjectId: savedTodo.subjectId,
      title: savedTodo.title,
      description: savedTodo.description,
      dueDate: savedTodo.dueDate,
      expectedMinutes: savedTodo.expectedMinutes,
      priority: savedTodo.priority,
      sourceType: savedTodo.sourceType,
      status: savedTodo.status,
      completedAt: savedTodo.completedAt?.toISOString() ?? null,
    };
  }

  async complete(userId: string, todoItemId: string, dto: CompleteTodoDto) {
    const todo = await this.todosRepository.findTodoById(todoItemId);
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException('NOT_FOUND');
    }

    if (todo.status === 'completed') {
      throw new ConflictException('TODO_ALREADY_COMPLETED');
    }

    todo.status = 'completed';
    todo.completedAt = dto.completedAt ? new Date(dto.completedAt) : new Date();

    const savedTodo = await this.todosRepository.saveTodo(todo);
    const todayPendingCount =
      await this.todosRepository.countPendingTodosByDate(
        userId,
        getTodayDate(),
      );

    return {
      todoItemId: savedTodo.id,
      status: savedTodo.status,
      completedAt:
        savedTodo.completedAt?.toISOString() ?? new Date().toISOString(),
      todayPendingCount,
    };
  }

  async remove(userId: string, todoItemId: string) {
    const todo = await this.todosRepository.findTodoById(todoItemId);
    if (!todo || todo.userId !== userId) {
      throw new NotFoundException('NOT_FOUND');
    }

    await this.todosRepository.removeTodo(todo);
    return undefined;
  }

  private assertAllowedSort(sortBy?: string) {
    const allowedSorts = ['due_date', 'priority', 'created_at', undefined];
    if (!allowedSorts.includes(sortBy)) {
      throw new BadRequestException('INVALID_PARAMS');
    }
  }

  private getSummaryCount(
    rows: Array<{ status: string; count: string }>,
    status: string,
  ) {
    return Number(rows.find((row) => row.status === status)?.count ?? 0);
  }

  private async validatePlanContext(
    userId: string,
    dto: Pick<
      CreateTodoDto,
      'studyPlanId' | 'weeklyPlanId' | 'dailyPlanId' | 'dueDate'
    >,
  ) {
    const dueDate = dto.dueDate.slice(0, 10);
    let studyPlanId = dto.studyPlanId;

    if (dto.studyPlanId) {
      const studyPlan = await this.plansRepository.findStudyPlanByIdForUser(
        dto.studyPlanId,
        userId,
      );
      if (!studyPlan) {
        throw new BadRequestException('INVALID_PARAMS');
      }
      studyPlanId = studyPlan.id;
    }

    if (dto.weeklyPlanId) {
      const weeklyPlan = await this.plansRepository.findWeeklyPlanByIdForUser(
        dto.weeklyPlanId,
        userId,
      );
      if (!weeklyPlan) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      if (studyPlanId && weeklyPlan.studyPlanId !== studyPlanId) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      studyPlanId = weeklyPlan.studyPlanId;
    }

    if (dto.dailyPlanId) {
      const dailyPlan = await this.plansRepository.findDailyPlanByIdForUser(
        dto.dailyPlanId,
        userId,
      );
      if (!dailyPlan) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      if (studyPlanId && dailyPlan.studyPlanId !== studyPlanId) {
        throw new BadRequestException('INVALID_PARAMS');
      }

      if (dailyPlan.planDate !== dueDate) {
        throw new BadRequestException('INVALID_PARAMS');
      }
    }
  }
}
