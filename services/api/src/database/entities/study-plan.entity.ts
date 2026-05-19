import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { TimestampedEntity } from './base/timestamped.entity';
import { UserTargetEntity } from './user-target.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'study_plans' })
export class StudyPlanEntity extends TimestampedEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'user_target_id',
    type: 'uuid',
  })
  userTargetId!: string;

  @ManyToOne(() => UserTargetEntity)
  @JoinColumn({ name: 'user_target_id' })
  userTarget!: UserTargetEntity;

  @Column({
    name: 'template_type',
    type: 'varchar',
    length: 30,
  })
  templateType!: 'standard' | 'weak_foundation' | 'cross_major' | 'working';

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    name: 'start_date',
    type: 'date',
  })
  startDate!: string;

  @Column({
    name: 'end_date',
    type: 'date',
  })
  endDate!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status!: 'draft' | 'active' | 'completed' | 'archived';

  @Column({
    name: 'total_expected_hours',
    type: 'numeric',
    precision: 8,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  totalExpectedHours!: number | null;

  @Column({
    name: 'plan_snapshot',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  planSnapshot!: Record<string, unknown>;
}
