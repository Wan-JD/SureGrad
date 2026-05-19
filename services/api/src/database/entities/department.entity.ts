import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SoftDeletableEntity } from './base/soft-deletable.entity';
import { SchoolEntity } from './school.entity';

@Entity({ name: 'departments' })
export class DepartmentEntity extends SoftDeletableEntity {
  @Column({
    name: 'school_id',
    type: 'uuid',
  })
  schoolId!: string;

  @ManyToOne(() => SchoolEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'school_id' })
  school!: SchoolEntity;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  code!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  website!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status!: 'active' | 'inactive';
}
