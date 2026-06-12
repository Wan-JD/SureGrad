import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { numericTransformer } from './base/numeric.transformer';
import { SoftDeletableEntity } from './base/soft-deletable.entity';
import { DepartmentEntity } from './department.entity';
import { SchoolEntity } from './school.entity';

@Entity({ name: 'programs' })
export class ProgramEntity extends SoftDeletableEntity {
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

  @Column({
    name: 'department_id',
    type: 'uuid',
  })
  departmentId!: string;

  @ManyToOne(() => DepartmentEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department!: DepartmentEntity;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({
    name: 'degree_type',
    type: 'varchar',
    length: 20,
  })
  degreeType!: 'academic' | 'professional';

  @Column({
    name: 'discipline_category',
    type: 'varchar',
    length: 100,
  })
  disciplineCategory!: string;

  @Column({
    name: 'research_direction',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  researchDirection!: string | null;

  @Column({
    name: 'exam_math_required',
    type: 'boolean',
    default: false,
  })
  examMathRequired!: boolean;

  @Column({
    name: 'duration_years',
    type: 'numeric',
    precision: 3,
    scale: 1,
    nullable: true,
    transformer: numericTransformer,
  })
  durationYears!: number | null;

  @Column({
    name: 'tuition_per_year',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  tuitionPerYear!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  notes!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status!: 'active' | 'inactive';
}
