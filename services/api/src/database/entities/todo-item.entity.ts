import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { DailyPlanEntity } from './daily-plan.entity';
import { StudyPlanEntity } from './study-plan.entity';
import { SubjectEntity } from './subject.entity';
import { UserEntity } from './user.entity';
import { WeeklyPlanEntity } from './weekly-plan.entity';

@Entity({ name: 'todo_items' })
export class TodoItemEntity extends TimestampedEntity {
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
    name: 'study_plan_id',
    type: 'uuid',
    nullable: true,
  })
  studyPlanId!: string | null;

  @ManyToOne(() => StudyPlanEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'study_plan_id' })
  studyPlan!: StudyPlanEntity | null;

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
    name: 'daily_plan_id',
    type: 'uuid',
    nullable: true,
  })
  dailyPlanId!: string | null;

  @ManyToOne(() => DailyPlanEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'daily_plan_id' })
  dailyPlan!: DailyPlanEntity | null;

  @Column({
    name: 'subject_id',
    type: 'uuid',
    nullable: true,
  })
  subjectId!: string | null;

  @ManyToOne(() => SubjectEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subject_id' })
  subject!: SubjectEntity | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'due_date',
    type: 'date',
  })
  dueDate!: string;

  @Column({
    name: 'expected_minutes',
    type: 'int',
    default: 0,
  })
  expectedMinutes!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'medium',
  })
  priority!: 'low' | 'medium' | 'high';

  @Column({
    name: 'source_type',
    type: 'varchar',
    length: 20,
    default: 'manual',
  })
  sourceType!: 'manual' | 'generated';

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  status!: 'pending' | 'completed' | 'cancelled';

  @Column({
    name: 'completed_at',
    type: 'timestamptz',
    nullable: true,
  })
  completedAt!: Date | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder!: number;
}
