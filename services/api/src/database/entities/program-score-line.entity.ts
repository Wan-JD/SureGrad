import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_score_lines' })
export class ProgramScoreLineEntity extends TimestampedEntity {
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
    name: 'total_score',
    type: 'int',
  })
  totalScore!: number;

  @Column({
    name: 'politics_score',
    type: 'int',
  })
  politicsScore!: number;

  @Column({
    name: 'english_score',
    type: 'int',
  })
  englishScore!: number;

  @Column({
    name: 'subject_one_score',
    type: 'int',
  })
  subjectOneScore!: number;

  @Column({
    name: 'subject_two_score',
    type: 'int',
  })
  subjectTwoScore!: number;

  @Column({
    name: 'score_line_type',
    type: 'varchar',
    length: 30,
  })
  scoreLineType!: 'national_a' | 'national_b' | 'school' | 'retest';

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
