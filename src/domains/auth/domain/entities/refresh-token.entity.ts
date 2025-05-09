import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@common/base/abstract.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'token',
    type: 'varchar',
    unique: true,
    nullable: false,
    length: 255,
  })
  token: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false, unique: true })
  userId: string;

  @Column({
    name: 'is_revoked',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isRevoked: boolean;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  expiresAt: Date;
}
