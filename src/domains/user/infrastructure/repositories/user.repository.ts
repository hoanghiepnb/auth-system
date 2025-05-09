import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@subdomain/user/domain/entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(userId: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id: userId } });
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(userId: string, userData: Partial<UserEntity>): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        ...userData,
        updatedAt: new Date(),
      },
    );
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        password,
        updatedAt: new Date(),
      },
    );
  }

  async updateLastLogin(userId: string, date: Date): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        lastLoginAt: date,
        updatedAt: new Date(),
      },
    );
  }

  async updateLoginAttempts(userId: string, attempts: number): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        loginAttempts: attempts,
        updatedAt: new Date(),
      },
    );
  }

  async incrementLoginAttempts(userId: string): Promise<number> {
    // Get current login attempts
    const user = await this.findById(userId);
    if (!user) return 0;

    const attempts = (user.loginAttempts || 0) + 1;

    await this.repository.update({ id: userId }, { loginAttempts: attempts });

    return attempts;
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.repository.update({ id: userId }, { loginAttempts: 0 });
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isLocked: true,
        lockUntil,
        updatedAt: new Date(),
      },
    );
  }

  async unlockAccount(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isLocked: false,
        lockUntil: null,
        loginAttempts: 0,
        updatedAt: new Date(),
      },
    );
  }

  async activateAccount(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isActive: true,
        updatedAt: new Date(),
      },
    );
  }

  async deactivateAccount(userId: string): Promise<void> {
    await this.repository.update(
      { id: userId },
      {
        isActive: false,
        updatedAt: new Date(),
      },
    );
  }

  async updateProfile(
    userId: string,
    profileData: Partial<UserEntity>,
  ): Promise<void> {
    const allowedFields = ['firstName', 'lastName', 'avatarUrl', 'phoneNumber'];

    const filteredData: Partial<UserEntity> = {};

    for (const field of allowedFields) {
      if (field in profileData) {
        filteredData[field] = profileData[field];
      }
    }

    filteredData.updatedAt = new Date();

    await this.repository.update({ id: userId }, filteredData);
  }
}
