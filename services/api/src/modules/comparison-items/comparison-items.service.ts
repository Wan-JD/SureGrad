import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateComparisonItemDto } from './dto/create-comparison-item.dto';
import { QueryComparisonResultDto } from './dto/query-comparison-result.dto';
import { ComparisonItemsRepository } from './repositories/comparison-items.repository';

const COMPARISON_POOL_LIMIT = 4;

const COMPARISON_RESULT_DIMENSIONS = [
  {
    key: 'totalScore',
    label: '分数线',
    unit: '分',
  },
  {
    key: 'applicationRatio',
    label: '报录比',
    unit: '比值',
  },
  {
    key: 'interviewRatio',
    label: '复录比',
    unit: '比值',
  },
  {
    key: 'plannedEnrollment',
    label: '招生人数',
    unit: '人',
  },
  {
    key: 'tuitionPerYear',
    label: '学费',
    unit: '元/年',
  },
  {
    key: 'city',
    label: '城市',
    unit: null,
  },
  {
    key: 'examSubjects',
    label: '初试科目',
    unit: null,
  },
] as const;

@Injectable()
export class ComparisonItemsService {
  constructor(
    private readonly comparisonItemsRepository: ComparisonItemsRepository,
  ) {}

  async create(userId: string, dto: CreateComparisonItemDto) {
    const existingItem =
      await this.comparisonItemsRepository.findComparisonItemByUserAndTarget(
        userId,
        dto.targetType,
        dto.targetId,
      );
    if (existingItem) {
      throw new ConflictException('COMPARE_ITEM_DUPLICATED');
    }

    const currentCount =
      await this.comparisonItemsRepository.countComparisonItemsByUser(userId);
    if (currentCount >= COMPARISON_POOL_LIMIT) {
      throw new BadRequestException('COMPARE_LIMIT_EXCEEDED');
    }

    const program = await this.comparisonItemsRepository.findProgramById(
      dto.targetId,
    );
    if (!program) {
      throw new NotFoundException('NOT_FOUND');
    }

    try {
      const item = this.comparisonItemsRepository.createComparisonItem({
        userId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      });
      const savedItem =
        await this.comparisonItemsRepository.saveComparisonItem(item);

      return {
        comparisonItemId: savedItem.id,
        currentCount: currentCount + 1,
        maxCount: COMPARISON_POOL_LIMIT,
      };
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('COMPARE_ITEM_DUPLICATED');
      }

      throw error;
    }
  }

  async remove(userId: string, targetType: 'program', targetId: string) {
    const comparisonItem =
      await this.comparisonItemsRepository.findComparisonItemByUserAndTarget(
        userId,
        targetType,
        targetId,
      );
    if (!comparisonItem) {
      throw new NotFoundException('NOT_FOUND');
    }

    await this.comparisonItemsRepository.removeComparisonItem(comparisonItem);
  }

  async getResult(userId: string, query: QueryComparisonResultDto) {
    const items = await this.comparisonItemsRepository.getComparisonResultItems(
      userId,
      query.examYear,
    );
    if (items.length === 0) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    return {
      items,
      dimensions: COMPARISON_RESULT_DIMENSIONS,
    };
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    );
  }
}
