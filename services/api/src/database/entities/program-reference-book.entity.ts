import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { BookEntity } from './book.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_reference_books' })
export class ProgramReferenceBookEntity extends TimestampedEntity {
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
    name: 'book_id',
    type: 'uuid',
  })
  bookId!: string;

  @ManyToOne(() => BookEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'book_id' })
  book!: BookEntity;

  @Column({
    name: 'exam_year',
    type: 'int',
  })
  examYear!: number;

  @Column({
    name: 'subject_role',
    type: 'varchar',
    length: 30,
  })
  subjectRole!: string;

  @Column({
    name: 'is_required',
    type: 'boolean',
    default: false,
  })
  isRequired!: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;
}
