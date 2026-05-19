import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { QueryResourcesDto } from './dto/query-resources.dto';
import { ResourcesService } from './resources.service';

@Controller('study-resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll(@Query() query: QueryResourcesDto) {
    return this.resourcesService.findAll(query);
  }

  @Get(':resourceId')
  findOne(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.resourcesService.findOne(resourceId);
  }
}
