import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { ProgramEntity } from './program.entity';

@Entity({ name: 'program_source_links' })
@Index(
  'uq_program_source_links_program_year_url',
  ['programId', 'examYear', 'url'],
  {
    unique: true,
    where: '"exam_year" IS NOT NULL',
  },
)
@Index(
  'uq_program_source_links_program_url_when_year_null',
  ['programId', 'url'],
  {
    unique: true,
    where: '"exam_year" IS NULL',
  },
)
export class ProgramSourceLinkEntity extends TimestampedEntity {
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
    nullable: true,
  })
  examYear!: number | null;

  @Column({
    name: 'source_type',
    type: 'varchar',
    length: 50,
  })
  sourceType!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  url!: string;

  @Column({
    name: 'publisher_name',
    type: 'varchar',
    length: 255,
  })
  publisherName!: string;

  @Column({
    name: 'published_at',
    type: 'date',
    nullable: true,
  })
  publishedAt!: string | null;

  @Column({
    name: 'last_verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastVerifiedAt!: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status!: 'active' | 'invalid' | 'pending';

  @Column({
    name: 'source_confidence',
    type: 'varchar',
    length: 20,
  })
  sourceConfidence!: 'official' | 'estimated' | 'manual';

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;
}
