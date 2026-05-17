import { IsIn, IsUUID } from 'class-validator';

export class CreateComparisonItemDto {
  @IsIn(['program'])
  targetType!: 'program';

  @IsUUID()
  targetId!: string;
}
