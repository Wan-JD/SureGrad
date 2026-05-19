import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { TimestampedEntity } from './base/timestamped.entity';
import { StudyPlanEntity } from './study-plan.entity';
import { WeeklyPlanEntity } from './weekly-plan.entity';

@Entity({ name: 'daily_plans' })
export class DailyPlanEntity extends TimestampedEntity {
  @Column({
    name: 'study_plan_id',
    type: 'uuid',
  })
  studyPlanId!: string;

  @ManyToOne(() => StudyPlanEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'study_plan_id' })
  studyPlan!: StudyPlanEntity;

  @Column({
    name: 'weekly_plan_id',
    type: 'uuid',
    nullable: true,
  })
  weeklyPlanId!: string | null;

  @ManyToOne(() => WeeklyPlanEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'weekly_plan_id' })
  weeklyPlan!: WeeklyPlanEntity | null;

  @Column({
    name: 'plan_date',
    type: 'date',
  })
  planDate!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    name: 'expected_hours',
    type: 'numeric',
    precision: 5,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  expectedHours!: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status!: 'draft' | 'active' | 'completed' | 'skipped';
}
