import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/abstract.entity';

@Entity('password_resets')
export class PasswordResetEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'token',
    type: 'varchar',
    unique: true,
  })
  token: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: string;

  @Column({ name: 'is_used', type: 'boolean', default: false, nullable: false })
  isUsed: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  expiresAt: Date;
}
