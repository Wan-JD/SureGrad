import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_admissions' })
export class ProgramAdmissionEntity extends TimestampedEntity {
  @Column({
    name: 'program_id',
    type: 'uuid',
  })
  programId!: string;

  @ManyToOne(() => ProgramEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'program_id' })
  program!: ProgramEntity;

  @Column({
    name: 'exam_year',
    type: 'int',
  })
  examYear!: number;

  @Column({
    name: 'planned_enrollment',
    type: 'int',
  })
  plannedEnrollment!: number;

  @Column({
    name: 'recommended_exemption_count',
    type: 'int',
    nullable: true,
  })
  recommendedExemptionCount!: number | null;

  @Column({
    name: 'unified_exam_quota',
    type: 'int',
    nullable: true,
  })
  unifiedExamQuota!: number | null;

  @Column({
    name: 'actual_enrollment',
    type: 'int',
    nullable: true,
  })
  actualEnrollment!: number | null;

  @Column({
    name: 'is_cross_major_allowed',
    type: 'boolean',
    default: false,
  })
  isCrossMajorAllowed!: boolean;

  @Column({
    name: 'memo',
    type: 'text',
    nullable: true,
  })
  memo!: string | null;

  @Column({
    name: 'source_confidence',
    type: 'varchar',
    length: 20,
  })
  sourceConfidence!: 'official' | 'estimated' | 'manual';
}
