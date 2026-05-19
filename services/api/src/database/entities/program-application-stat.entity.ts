import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_application_stats' })
export class ProgramApplicationStatEntity extends TimestampedEntity {
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
    name: 'applicant_count',
    type: 'int',
  })
  applicantCount!: number;

  @Column({
    name: 'actual_exam_count',
    type: 'int',
    nullable: true,
  })
  actualExamCount!: number | null;

  @Column({
    name: 'admitted_count',
    type: 'int',
  })
  admittedCount!: number;

  @Column({
    name: 'application_ratio',
    type: 'numeric',
    precision: 8,
    scale: 2,
    transformer: numericTransformer,
  })
  applicationRatio!: number;

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
