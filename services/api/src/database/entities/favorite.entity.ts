import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'favorites' })
@Index('uq_favorites_user_target', ['userId', 'targetType', 'targetId'], {
  unique: true,
})
@Index('idx_favorites_user_created_at', ['userId', 'createdAt'])
export class FavoriteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
    name: 'target_type',
    type: 'varchar',
    length: 30,
  })
  targetType!: 'school' | 'program' | 'resource';

  @Column({
    name: 'target_id',
    type: 'uuid',
  })
  targetId!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
