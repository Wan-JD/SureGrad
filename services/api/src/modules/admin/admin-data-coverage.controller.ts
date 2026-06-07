import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../common/auth/admin-auth.guard';
import { AdminDataCoverageService } from './admin-data-coverage.service';

@Controller('admin/data-coverage')
@UseGuards(AdminAuthGuard)
export class AdminDataCoverageController {
  constructor(
    private readonly adminDataCoverageService: AdminDataCoverageService,
  ) {}

  @Get()
  summary() {
    return this.adminDataCoverageService.summary();
  }
}
