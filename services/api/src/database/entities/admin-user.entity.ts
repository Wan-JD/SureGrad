import { Column, Entity } from 'typeorm';
import { TimestampedEntity } from './base/timestamped.entity';

@Entity({ name: 'admin_users' })
export class AdminUserEntity extends TimestampedEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
  })
  displayName!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash!: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'admin',
  })
  role!: 'super_admin' | 'admin';

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
}
