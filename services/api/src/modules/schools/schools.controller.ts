import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuerySchoolDetailDto } from './dto/query-school-detail.dto';
import { QuerySchoolProgramsDto } from './dto/query-school-programs.dto';
import { QuerySchoolsDto } from './dto/query-schools.dto';
import { SchoolsService } from './schools.service';

@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findAll(@Query() query: QuerySchoolsDto) {
    return this.schoolsService.findAll(query);
  }

  @Get(':schoolId')
  findOne(
    @Param('schoolId') schoolId: string,
    @Query() query: QuerySchoolDetailDto,
  ) {
    return this.schoolsService.findOne(schoolId, query);
  }

  @Get(':schoolId/programs')
  findPrograms(
    @Param('schoolId') schoolId: string,
    @Query() query: QuerySchoolProgramsDto,
  ) {
    return this.schoolsService.findPrograms(schoolId, query);
  }
}
