import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CompleteTodoDto } from './dto/complete-todo.dto';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@Controller('todo-items')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(@Query() query: QueryTodosDto) {
    return this.todosService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateTodoDto) {
    return this.todosService.create(dto);
  }

  @Patch(':todoItemId')
  update(@Param('todoItemId') todoItemId: string, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(todoItemId, dto);
  }

  @Post(':todoItemId/complete')
  complete(
    @Param('todoItemId') todoItemId: string,
    @Body() dto: CompleteTodoDto,
  ) {
    return this.todosService.complete(todoItemId, dto);
  }

  @Delete(':todoItemId')
  remove(@Param('todoItemId') todoItemId: string) {
    return this.todosService.remove(todoItemId);
  }
}
