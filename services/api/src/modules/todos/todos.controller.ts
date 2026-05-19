import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@Controller('todo-items')
@UseGuards(MockAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryTodosDto) {
    return this.todosService.findAll(user.userId, query);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTodoDto) {
    return this.todosService.create(user.userId, dto);
  }

  @Patch(':todoItemId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('todoItemId') todoItemId: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todosService.update(user.userId, todoItemId, dto);
  }

  @Post(':todoItemId/complete')
  @HttpCode(200)
  complete(
    @CurrentUser() user: AuthUser,
    @Param('todoItemId') todoItemId: string,
    @Body() dto: CompleteTodoDto,
  ) {
    return this.todosService.complete(user.userId, todoItemId, dto);
  }

  @Delete(':todoItemId')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('todoItemId') todoItemId: string,
  ) {
    return this.todosService.remove(user.userId, todoItemId);
  }
}
