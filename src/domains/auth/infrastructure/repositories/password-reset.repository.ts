import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PasswordResetEntity } from '@subdomain/auth/domain/entities/password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordResetEntity)
    private repository: Repository<PasswordResetEntity>,
  ) {}

  async create(
    data: Partial<PasswordResetEntity>,
  ): Promise<PasswordResetEntity> {
    const token = this.repository.create(data);
    return this.repository.save(token);
  }

  async findByToken(token: string): Promise<PasswordResetEntity> {
    return this.repository.findOne({ where: { token } });
  }

  async markAsUsed(token: string): Promise<void> {
    await this.repository.update({ token }, { isUsed: true });
  }

  async findByUserId(userId: string): Promise<PasswordResetEntity[]> {
    return this.repository.find({
      where: { userId, isUsed: false },
      order: { createdAt: 'DESC' },
    });
  }

  async cleanExpired(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }
}
