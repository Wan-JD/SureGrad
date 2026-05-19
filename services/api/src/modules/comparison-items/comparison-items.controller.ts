import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MockAuthGuard } from '../../common/auth/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { ComparisonItemsService } from './comparison-items.service';
import { CreateComparisonItemDto } from './dto/create-comparison-item.dto';
import { QueryComparisonResultDto } from './dto/query-comparison-result.dto';

@Controller('comparison-items')
@UseGuards(MockAuthGuard)
export class ComparisonItemsController {
  constructor(
    private readonly comparisonItemsService: ComparisonItemsService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateComparisonItemDto) {
    return this.comparisonItemsService.create(user.userId, dto);
  }

  @Delete()
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Query() query: CreateComparisonItemDto,
  ) {
    return this.comparisonItemsService.remove(
      user.userId,
      query.targetType,
      query.targetId,
    );
  }

  @Get('result')
  getResult(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryComparisonResultDto,
  ) {
    return this.comparisonItemsService.getResult(user.userId, query);
  }
}
