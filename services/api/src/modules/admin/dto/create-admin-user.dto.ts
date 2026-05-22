import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  username!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsIn(['super_admin', 'admin'])
  role!: 'super_admin' | 'admin';
}
