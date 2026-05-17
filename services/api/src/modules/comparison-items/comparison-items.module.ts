import { Module } from '@nestjs/common';
import { ComparisonItemsController } from './comparison-items.controller';
import { ComparisonItemsService } from './comparison-items.service';

@Module({
  controllers: [ComparisonItemsController],
  providers: [ComparisonItemsService],
})
export class ComparisonItemsModule {}
