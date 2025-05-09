import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from '@subdomain/user/infrastructure/repositories/user.repository';
import { UserEntity } from '@subdomain/user/domain/entities/user.entity';
import { UpdateProfileDto } from '@subdomain/user/application/dtos/update-profile.dto';
import { UserResponseDto } from '@subdomain/user/application/dtos/user-response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      return await this.userRepository.findByEmail(email.toLowerCase());
    } catch (error) {
      this.logger.error(
        `Error finding user by email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(userId: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        this.logger.warn(`User not found with ID: ${userId}`);
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding user by ID: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createUser(email: string, password: string): Promise<UserEntity> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user with normalized email
      const newUser = await this.userRepository.create({
        email: email.toLowerCase(),
        password,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      this.logger.log(`User created successfully with ID: ${newUser.id}`);
      return newUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    profileData: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      // Verify user exists
      await this.findById(userId);

      // Check if email is being updated and is already taken
      if (profileData.email) {
        const existingUser = await this.findByEmail(profileData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('Email is already in use');
        }
      }

      // Update profile data
      await this.userRepository.updateProfile(userId, profileData);
      const updatedUser = await this.findById(userId);

      this.logger.log(`Profile updated for user: ${userId}`);
      return UserResponseDto.fromEntity(updatedUser);
    } catch (error) {
      this.logger.error(
        `Error updating profile: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.updatePassword(userId, password);

      this.logger.log(`Password updated for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error updating password: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.findById(userId);

      // Update last login timestamp
      await this.userRepository.updateLastLogin(userId, new Date());

      this.logger.debug(`Last login updated for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error updating last login: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async incrementLoginAttempts(userId: string): Promise<number> {
    try {
      await this.findById(userId);
      const attempts = await this.userRepository.incrementLoginAttempts(userId);

      this.logger.debug(
        `Login attempts incremented for user ${userId}: ${attempts}`,
      );

      return attempts;
    } catch (error) {
      this.logger.error(
        `Error incrementing login attempts: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.resetLoginAttempts(userId);

      this.logger.debug(`Login attempts reset for user: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error resetting login attempts: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.lockAccount(userId, lockUntil);

      this.logger.warn(`User account locked until ${lockUntil}: ${userId}`);
    } catch (error) {
      this.logger.error(`Error locking account: ${error.message}`, error.stack);
      throw error;
    }
  }

  async unlockAccount(userId: string): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.unlockAccount(userId);

      this.logger.log(`User account unlocked: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error unlocking account: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async activateAccount(userId: string): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.activateAccount(userId);

      this.logger.log(`User account activated: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error activating account: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async deactivateAccount(userId: string): Promise<void> {
    try {
      await this.findById(userId);
      await this.userRepository.deactivateAccount(userId);

      this.logger.log(`User account deactivated: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error deactivating account: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getActivityLogs(userId: string): Promise<any> {
    try {
      const user = await this.findById(userId);
      return {
        lastLoginAt: user.lastLoginAt,
      };
    } catch (error) {
      this.logger.error(
        `Error getting activity logs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
