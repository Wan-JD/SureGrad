import { IsIn, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsIn(['school', 'program', 'resource'])
  targetType!: 'school' | 'program' | 'resource';

  @IsUUID()
  targetId!: string;
}
