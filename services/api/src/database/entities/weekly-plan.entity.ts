import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { TimestampedEntity } from './base/timestamped.entity';
import { StudyPlanPhaseEntity } from './study-plan-phase.entity';
import { StudyPlanEntity } from './study-plan.entity';

@Entity({ name: 'weekly_plans' })
export class WeeklyPlanEntity extends TimestampedEntity {
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
    name: 'phase_id',
    type: 'uuid',
    nullable: true,
  })
  phaseId!: string | null;

  @ManyToOne(() => StudyPlanPhaseEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'phase_id' })
  phase!: StudyPlanPhaseEntity | null;

  @Column({
    name: 'week_start_date',
    type: 'date',
  })
  weekStartDate!: string;

  @Column({
    name: 'week_end_date',
    type: 'date',
  })
  weekEndDate!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  goals!: string | null;

  @Column({
    name: 'expected_hours',
    type: 'numeric',
    precision: 6,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  expectedHours!: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'draft',
  })
  status!: 'draft' | 'active' | 'completed' | 'skipped';
}
