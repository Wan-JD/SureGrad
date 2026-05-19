import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { numericTransformer } from './base/numeric.transformer';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_profiles' })
export class UserProfileEntity extends TimestampedEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
    unique: true,
  })
  userId!: string;

  @OneToOne(() => UserEntity, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'exam_year',
    type: 'int',
  })
  examYear!: number;

  @Column({
    name: 'identity_type',
    type: 'varchar',
    length: 20,
  })
  identityType!: 'fresh' | 'second_try' | 'working';

  @Column({
    name: 'undergraduate_major',
    type: 'varchar',
    length: 255,
  })
  undergraduateMajor!: string;

  @Column({
    name: 'intended_discipline',
    type: 'varchar',
    length: 255,
  })
  intendedDiscipline!: string;

  @Column({
    name: 'daily_study_hours',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  dailyStudyHours!: number | null;

  @Column({
    name: 'exam_math_required',
    type: 'boolean',
    default: false,
  })
  examMathRequired!: boolean;

  @Column({
    name: 'onboarding_completed',
    type: 'boolean',
    default: false,
  })
  onboardingCompleted!: boolean;
}
