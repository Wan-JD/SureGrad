import { DeleteDateColumn } from 'typeorm';
import { TimestampedEntity } from './timestamped.entity';

export abstract class SoftDeletableEntity extends TimestampedEntity {
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt!: Date | null;
}
