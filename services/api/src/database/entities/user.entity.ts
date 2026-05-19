import { Column, Entity, OneToOne } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';
import { UserProfileEntity } from './user-profile.entity';

@Entity({ name: 'users' })
export class UserEntity extends TimestampedEntity {
  @Column({ type: 'varchar', length: 30, unique: true })
  phone!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 100 })
  nickname!: string;

  @Column({
    name: 'avatar_url',
    type: 'text',
    nullable: true,
  })
  avatarUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status!: 'active' | 'disabled';

  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastLoginAt!: Date | null;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile?: UserProfileEntity | null;
}
