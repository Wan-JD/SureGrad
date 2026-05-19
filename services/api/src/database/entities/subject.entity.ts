import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';

@Entity({ name: 'subjects' })
export class SubjectEntity extends TimestampedEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  code!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
  })
  category!: 'politics' | 'english' | 'math' | 'major' | 'custom';
}
