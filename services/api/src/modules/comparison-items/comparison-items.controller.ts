import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ComparisonItemsService } from './comparison-items.service';
import { CreateComparisonItemDto } from './dto/create-comparison-item.dto';
import { QueryComparisonResultDto } from './dto/query-comparison-result.dto';

@Controller('comparison-items')
export class ComparisonItemsController {
  constructor(
    private readonly comparisonItemsService: ComparisonItemsService,
  ) {}

  @Post()
  create(@Body() dto: CreateComparisonItemDto) {
    return this.comparisonItemsService.create(dto);
  }

  @Delete()
  remove(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
  ) {
    return this.comparisonItemsService.remove(targetType, targetId);
  }

  @Get('result')
  getResult(@Query() query: QueryComparisonResultDto) {
    return this.comparisonItemsService.getResult(query);
  }
}
