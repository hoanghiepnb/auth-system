import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@common/base/abstract.entity';

@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'email',
    type: 'varchar',
    unique: true,
    length: 255,
    nullable: false,
  })
  email: string;

  @Column({ name: 'password', type: 'varchar', nullable: false })
  password: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    nullable: false,
  })
  isActive: boolean;

  @Column({
    name: 'is_locked',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isLocked: boolean;

  @Column({
    name: 'lock_until',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lockUntil: Date;

  @Column({ name: 'login_attempts', type: 'int', default: 0, nullable: false })
  loginAttempts: number;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastLoginAt: Date;

  // Profile-related fields
  @Column({
    name: 'first_name',
    type: 'varchar',
    nullable: true,
    length: 100,
    default: null,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    nullable: true,
    length: 100,
    default: null,
  })
  lastName: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    nullable: true,
    default: null,
    length: 255,
  })
  avatarUrl: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    nullable: true,
    length: 20,
    default: null,
  })
  phoneNumber: string;
}
