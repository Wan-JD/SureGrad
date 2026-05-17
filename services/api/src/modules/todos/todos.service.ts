import { Injectable } from '@nestjs/common';
import { buildSkeletonResponse } from '../../common/utils/build-skeleton-response';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  findAll(query: QueryTodosDto) {
    return buildSkeletonResponse({
      domain: 'todos',
      action: 'findAll',
      message:
        'Todo list querying is scaffolded, but filtering and plan joins are not implemented yet.',
      nextSteps: [
        'Load todo_items by user, date, and status.',
        'Attach subject labels and plan context.',
        'Compute summary counts for the current filter.',
      ],
      payload: query,
    });
  }

  create(dto: CreateTodoDto) {
    return buildSkeletonResponse({
      domain: 'todos',
      action: 'create',
      message:
        'Todo creation contract is ready, but persistence and ownership checks are still pending.',
      nextSteps: [
        'Validate referenced study plan context.',
        'Insert into todo_items with sort order defaults.',
        'Refresh daily summary projections after writes.',
      ],
      payload: dto,
    });
  }

  update(todoItemId: string, dto: UpdateTodoDto) {
    return buildSkeletonResponse({
      domain: 'todos',
      action: 'update',
      message:
        'Todo update endpoint is scaffolded, but write logic has not been implemented yet.',
      nextSteps: [
        'Load todo ownership for the current user.',
        'Apply partial field updates and validation.',
        'Emit domain events for analytics if needed.',
      ],
      payload: {
        todoItemId,
        ...dto,
      },
    });
  }

  complete(todoItemId: string, dto: CompleteTodoDto) {
    return buildSkeletonResponse({
      domain: 'todos',
      action: 'complete',
      message:
        'Todo completion is scaffolded, but completion idempotency and summary recomputation are still pending.',
      nextSteps: [
        'Validate todo ownership and current status.',
        'Persist completed status with completion timestamp.',
        'Recompute today pending counts and downstream study stats.',
      ],
      payload: {
        todoItemId,
        ...dto,
      },
    });
  }

  remove(todoItemId: string) {
    return buildSkeletonResponse({
      domain: 'todos',
      action: 'remove',
      message:
        'Todo deletion route exists, but soft-delete versus hard-delete behavior still needs to be chosen.',
      nextSteps: [
        'Define deletion strategy.',
        'Remove or archive the target todo item.',
      ],
      payload: { todoItemId },
    });
  }
}
