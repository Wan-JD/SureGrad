import { Column, Entity } from 'typeorm';
import { SoftDeletableEntity } from './base/soft-deletable.entity';

@Entity({ name: 'schools' })
export class SchoolEntity extends SoftDeletableEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({
    name: 'short_name',
    type: 'varchar',
    length: 100,
  })
  shortName!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  code!: string | null;

  @Column({ type: 'varchar', length: 50 })
  province!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({
    name: 'school_type',
    type: 'varchar',
    length: 50,
  })
  schoolType!: string;

  @Column({
    name: 'school_level',
    type: 'varchar',
    length: 100,
  })
  schoolLevel!: string;

  @Column({
    name: 'has_graduate_school',
    type: 'boolean',
    default: false,
  })
  hasGraduateSchool!: boolean;

  @Column({
    name: 'official_website',
    type: 'text',
    nullable: true,
  })
  officialWebsite!: string | null;

  @Column({
    name: 'graduate_website',
    type: 'text',
    nullable: true,
  })
  graduateWebsite!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
  })
  sortOrder!: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status!: 'active' | 'inactive';
}
