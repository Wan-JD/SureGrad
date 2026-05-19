import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_interview_stats' })
export class ProgramInterviewStatEntity extends TimestampedEntity {
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
    name: 'retest_candidate_count',
    type: 'int',
  })
  retestCandidateCount!: number;

  @Column({
    name: 'final_admitted_count',
    type: 'int',
  })
  finalAdmittedCount!: number;

  @Column({
    name: 'interview_ratio',
    type: 'numeric',
    precision: 8,
    scale: 2,
    transformer: numericTransformer,
  })
  interviewRatio!: number;

  @Column({
    name: 'retest_weight',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  retestWeight!: number;

  @Column({
    name: 'initial_exam_weight',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: numericTransformer,
  })
  initialExamWeight!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;

  @Column({
    name: 'source_confidence',
    type: 'varchar',
    length: 20,
  })
  sourceConfidence!: 'official' | 'estimated' | 'manual';
}
