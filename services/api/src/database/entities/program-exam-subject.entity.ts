import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';
import { SubjectEntity } from './subject.entity';

@Entity({ name: 'program_exam_subjects' })
export class ProgramExamSubjectEntity extends TimestampedEntity {
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
    name: 'subject_id',
    type: 'uuid',
  })
  subjectId!: string;

  @ManyToOne(() => SubjectEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subject_id' })
  subject!: SubjectEntity;

  @Column({
    name: 'exam_year',
    type: 'int',
  })
  examYear!: number;

  @Column({
    name: 'sequence_no',
    type: 'int',
  })
  sequenceNo!: number;

  @Column({
    name: 'subject_role',
    type: 'varchar',
    length: 30,
  })
  subjectRole!: string;

  @Column({
    name: 'subject_code_text',
    type: 'varchar',
    length: 50,
  })
  subjectCodeText!: string;

  @Column({
    name: 'subject_name_text',
    type: 'varchar',
    length: 200,
  })
  subjectNameText!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;
}
