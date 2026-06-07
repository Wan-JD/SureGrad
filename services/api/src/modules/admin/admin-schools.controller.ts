import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminSchoolsService } from './admin-schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { ListAdminSchoolsQueryDto } from './dto/list-admin-schools-query.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Controller('admin/schools')
@UseGuards(AdminAuthGuard)
export class AdminSchoolsController {
  constructor(private readonly adminSchoolsService: AdminSchoolsService) {}

  @Get()
  list(@Query() query: ListAdminSchoolsQueryDto) {
    return this.adminSchoolsService.list(query);
  }

  @Get('facets')
  facets() {
    return this.adminSchoolsService.facets();
  }

  @Get(':schoolId')
  findOne(@Param('schoolId') schoolId: string) {
    return this.adminSchoolsService.findOne(schoolId);
  }

  @Post()
  create(@Body() dto: CreateSchoolDto) {
    return this.adminSchoolsService.create(dto);
  }

  @Patch(':schoolId')
  update(@Param('schoolId') schoolId: string, @Body() dto: UpdateSchoolDto) {
    return this.adminSchoolsService.update(schoolId, dto);
  }
}
