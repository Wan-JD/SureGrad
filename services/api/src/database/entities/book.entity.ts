import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';

@Entity({ name: 'books' })
export class BookEntity extends TimestampedEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  author!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  publisher!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  isbn!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  edition!: string | null;

  @Column({
    name: 'cover_url',
    type: 'text',
    nullable: true,
  })
  coverUrl!: string | null;
}
