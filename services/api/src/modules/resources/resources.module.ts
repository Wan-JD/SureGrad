import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ResourcesRepository } from './repositories/resources.repository';
import { ResourcesService } from './resources.service';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesRepository, ResourcesService],
})
export class ResourcesModule {}
