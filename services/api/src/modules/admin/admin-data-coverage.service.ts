import { Injectable } from '@nestjs/common';
import { AdminDataCoverageRepository } from './repositories/admin-data-coverage.repository';

@Injectable()
export class AdminDataCoverageService {
  constructor(
    private readonly adminDataCoverageRepository: AdminDataCoverageRepository,
  ) {}

  summary() {
    return this.adminDataCoverageRepository.getSummary();
  }
}
