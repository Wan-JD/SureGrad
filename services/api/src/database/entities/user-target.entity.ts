import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { DepartmentEntity } from './department.entity';
import { ProgramEntity } from './program.entity';
import { SchoolEntity } from './school.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_targets' })
export class UserTargetEntity extends TimestampedEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({
    name: 'school_id',
    type: 'uuid',
  })
  schoolId!: string;

  @ManyToOne(() => SchoolEntity)
  @JoinColumn({ name: 'school_id' })
  school!: SchoolEntity;

  @Column({
    name: 'department_id',
    type: 'uuid',
    nullable: true,
  })
  departmentId!: string | null;

  @ManyToOne(() => DepartmentEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity | null;

  @Column({
    name: 'program_id',
    type: 'uuid',
    nullable: true,
  })
  programId!: string | null;

  @ManyToOne(() => ProgramEntity, {
    nullable: true,
  })
  @JoinColumn({ name: 'program_id' })
  program!: ProgramEntity | null;

  @Column({
    name: 'target_score',
    type: 'int',
    nullable: true,
  })
  targetScore!: number | null;

  @Column({
    name: 'target_status',
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  targetStatus!: 'active' | 'archived';

  @Column({
    name: 'selected_at',
    type: 'timestamptz',
  })
  selectedAt!: Date;
}
