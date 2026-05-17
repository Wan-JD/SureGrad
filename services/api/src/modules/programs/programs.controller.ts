import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryProgramDetailDto } from './dto/query-program-detail.dto';
import { ProgramsService } from './programs.service';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get(':programId')
  findOne(
    @Param('programId') programId: string,
    @Query() query: QueryProgramDetailDto,
  ) {
    return this.programsService.findOne(programId, query);
  }
}
