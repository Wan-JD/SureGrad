import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TodoItemEntity } from '../../../database/entities/todo-item.entity';

export interface TodoQueryParams {
  userId: string;
  date?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  subjectId?: string;
  sourceType?: 'manual' | 'generated';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

@Injectable()
export class TodosRepository {
  constructor(
    @InjectRepository(TodoItemEntity)
    private readonly todoItemsRepository: Repository<TodoItemEntity>,
  ) {}

  async findTodos(params: TodoQueryParams) {
    const query = this.todoItemsRepository
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.subject', 'subject')
      .where('todo.userId = :userId', { userId: params.userId });

    if (params.date) {
      query.andWhere('todo.dueDate = :date', { date: params.date });
    }

    if (params.status) {
      query.andWhere('todo.status = :status', { status: params.status });
    }

    if (params.subjectId) {
      query.andWhere('todo.subjectId = :subjectId', {
        subjectId: params.subjectId,
      });
    }

    if (params.sourceType) {
      query.andWhere('todo.sourceType = :sourceType', {
        sourceType: params.sourceType,
      });
    }

    this.applySort(query, params.sortBy, params.sortOrder);

    const [items, total] = await query
      .skip((params.page - 1) * params.pageSize)
      .take(params.pageSize)
      .getManyAndCount();

    const summaryRows = await this.todoItemsRepository
      .createQueryBuilder('todo')
      .select('todo.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('todo.userId = :userId', { userId: params.userId })
      .andWhere(params.date ? 'todo.dueDate = :date' : '1=1', {
        date: params.date,
      })
      .andWhere(params.subjectId ? 'todo.subjectId = :subjectId' : '1=1', {
        subjectId: params.subjectId,
      })
      .andWhere(params.sourceType ? 'todo.sourceType = :sourceType' : '1=1', {
        sourceType: params.sourceType,
      })
      .groupBy('todo.status')
      .getRawMany<{ status: string; count: string }>();

    return { items, total, summaryRows };
  }

  createTodo(payload: Partial<TodoItemEntity>) {
    return this.todoItemsRepository.create(payload);
  }

  saveTodo(todo: TodoItemEntity) {
    return this.todoItemsRepository.save(todo);
  }

  findTodoById(todoItemId: string) {
    return this.todoItemsRepository.findOne({
      where: { id: todoItemId },
      relations: {
        subject: true,
      },
    });
  }

  removeTodo(todo: TodoItemEntity) {
    return this.todoItemsRepository.remove(todo);
  }

  countPendingTodosByDate(userId: string, date: string) {
    return this.todoItemsRepository.count({
      where: {
        userId,
        dueDate: date,
        status: 'pending',
      },
    });
  }

  private applySort(
    query: SelectQueryBuilder<TodoItemEntity>,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const direction = sortOrder.toUpperCase() as 'ASC' | 'DESC';

    switch (sortBy) {
      case 'priority':
        query
          .orderBy(
            `CASE todo.priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END`,
            direction,
          )
          .addOrderBy('todo.dueDate', 'ASC')
          .addOrderBy('todo.createdAt', 'DESC');
        break;
      case 'created_at':
        query.orderBy('todo.createdAt', direction);
        break;
      case 'due_date':
      case undefined:
        query
          .orderBy('todo.dueDate', 'ASC')
          .addOrderBy(
            `CASE todo.priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END`,
            'DESC',
          )
          .addOrderBy('todo.createdAt', 'DESC');
        break;
      default:
        query
          .orderBy('todo.dueDate', 'ASC')
          .addOrderBy(
            `CASE todo.priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END`,
            'DESC',
          )
          .addOrderBy('todo.createdAt', 'DESC');
        break;
    }
  }
}
