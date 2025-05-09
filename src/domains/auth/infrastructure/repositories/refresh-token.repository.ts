import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { RefreshTokenEntity } from '@subdomain/auth/domain/entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private repository: Repository<RefreshTokenEntity>,
  ) {}

  async create(data: Partial<RefreshTokenEntity>): Promise<RefreshTokenEntity> {
    const token = this.repository.create(data);
    return this.repository.save(token);
  }

  async findByToken(token: string): Promise<RefreshTokenEntity> {
    return this.repository.findOne({ where: { token } });
  }

  async revokeToken(token: string): Promise<void> {
    await this.repository.update({ token }, { isRevoked: true });
  }

  async revokeAllForUser(userId: string, exceptToken?: string): Promise<void> {
    const query = { userId, isRevoked: false };

    if (exceptToken) {
      await this.repository.update(
        { ...query, token: Not(exceptToken) },
        { isRevoked: true },
      );
    } else {
      await this.repository.update(query, { isRevoked: true });
    }
  }

  async cleanExpired(): Promise<number> {
    const result = await this.repository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }
}
