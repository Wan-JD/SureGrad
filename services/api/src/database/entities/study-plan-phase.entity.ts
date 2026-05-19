import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { StudyPlanEntity } from './study-plan.entity';

@Entity({ name: 'study_plan_phases' })
export class StudyPlanPhaseEntity extends TimestampedEntity {
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
    name: 'phase_type',
    type: 'varchar',
    length: 30,
  })
  phaseType!: 'foundation' | 'intensive' | 'final' | 'interview';

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
    name: 'focus_subjects',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  focusSubjects!: unknown[];

  @Column({
    type: 'text',
    nullable: true,
  })
  goals!: string | null;

  @Column({
    name: 'sort_order',
    type: 'int',
  })
  sortOrder!: number;
}
