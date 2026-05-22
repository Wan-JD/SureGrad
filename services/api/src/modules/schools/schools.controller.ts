import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OptionalMockAuthGuard } from '../../common/auth/optional-mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/types/auth-user.type';
import { QuerySchoolDetailDto } from './dto/query-school-detail.dto';
import { QuerySchoolProgramsDto } from './dto/query-school-programs.dto';
import { QuerySchoolsDto } from './dto/query-schools.dto';
import { SchoolsService } from './schools.service';

@Controller('schools')
@UseGuards(OptionalMockAuthGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get()
  findAll(@Query() query: QuerySchoolsDto, @CurrentUser() user?: AuthUser) {
    return this.schoolsService.findAll(query, user?.userId);
  }

  @Get(':schoolId')
  findOne(
    @Param('schoolId') schoolId: string,
    @Query() query: QuerySchoolDetailDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.schoolsService.findOne(schoolId, query, user?.userId);
  }

  @Get(':schoolId/programs')
  findPrograms(
    @Param('schoolId') schoolId: string,
    @Query() query: QuerySchoolProgramsDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.schoolsService.findPrograms(schoolId, query, user?.userId);
  }
}
