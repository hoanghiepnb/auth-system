import {
  Injectable,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { RefreshTokenRepository } from '@subdomain/auth/infrastructure/repositories/refresh-token.repository';
import { PasswordResetRepository } from '@subdomain/auth/infrastructure/repositories/password-reset.repository';
import { UserService } from '@subdomain/user/application/user.service';
import { UserResponseDto } from '@subdomain/user/application/dtos/user-response.dto';
import { env } from '@common/config/env';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async register(email: string, password: string) {
    try {
      this.validatePasswordStrength(password);

      const hashedPassword = await this.hashPassword(password);

      const user = await this.userService.createUser(
        email.toLowerCase(),
        hashedPassword,
      );

      const tokenResponse = await this.generateTokens(user);

      return {
        ...tokenResponse,
        user: UserResponseDto.fromEntity(user),
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userService.findByEmail(email.toLowerCase());

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.isActive) {
        throw new ForbiddenException('Account is deactivated');
      }

      // Check if account is locked
      if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
        const remainingMinutes = Math.ceil(
          (user.lockUntil.getTime() - Date.now()) / 60000,
        );
        throw new ForbiddenException(
          `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`,
        );
      }

      // If lock has expired, unlock the account automatically
      if (user.isLocked && user.lockUntil && user.lockUntil <= new Date()) {
        await this.userService.unlockAccount(user.id);
      }

      if (!(await this.validatePassword(password, user.password))) {
        // Increment login attempts
        const attempts = await this.userService.incrementLoginAttempts(user.id);

        // Lock account if max attempts reached
        if (attempts >= env.MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date(
            Date.now() + env.ACCOUNT_LOCK_DURATION_MINUTES * 60000,
          );
          await this.userService.lockAccount(user.id, lockUntil);
          throw new ForbiddenException(
            `Too many failed login attempts. Account is locked for ${env.ACCOUNT_LOCK_DURATION_MINUTES} minutes.`,
          );
        }

        throw new UnauthorizedException(
          `Invalid credentials. ${env.MAX_LOGIN_ATTEMPTS - attempts} attempts remaining.`,
        );
      }

      // Reset login attempts counter on successful login
      await this.userService.resetLoginAttempts(user.id);

      // Update last login timestamp
      await this.userService.updateLastLogin(user.id);

      // Generate tokens
      const tokenResponse = await this.generateTokens(user);

      return {
        ...tokenResponse,
        user: UserResponseDto.fromEntity(user),
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logout(userId: string, refreshToken: string) {
    try {
      await this.refreshTokenRepository.revokeToken(refreshToken);
      return { success: true };
    } catch (error) {
      this.logger.error(`Logout failed for user ${userId}`, error.stack);
      return { success: false };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      // Validate refresh token
      const tokenEntity =
        await this.refreshTokenRepository.findByToken(refreshToken);

      if (
        !tokenEntity ||
        tokenEntity.isRevoked ||
        new Date() > tokenEntity.expiresAt
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.userService.findById(tokenEntity.userId);

      // Generate new access token
      const payload = {
        sub: user.id,
        email: user.email,
      };

      const accessToken = this.generateAccessToken(payload);

      return {
        accessToken,
        expiresIn: env.JWT_EXPIRATION_SECONDS,
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.userService.findByEmail(email.toLowerCase());

      if (!user) {
        this.logger.debug(
          `Password reset requested for non-existent email: ${email}`,
        );
        return {
          message:
            'If this account exists, a reset link has been sent to your email',
        };
      }

      // Generate reset token
      const token = uuidv4();

      // Set expiry to 1 hour from now (or use configured value)
      const expiresAt = new Date(Date.now() + env.CONFIRM_TOKEN_EXPIRATION_MS);

      // Save token to repository
      await this.passwordResetRepository.create({
        token,
        expiresAt,
        userId: user.id,
        isUsed: false,
      });

      this.logger.debug(
        `Password reset token for ${email}: ${token} (expires: ${expiresAt})`,
      );

      return {
        message:
          'If this account exists, a reset link has been sent to your email',
      };
    } catch (error) {
      this.logger.error(
        `Password reset request failed for email ${email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const resetToken = await this.passwordResetRepository.findByToken(token);

      if (
        !resetToken ||
        resetToken.isUsed ||
        new Date() > resetToken.expiresAt
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      await this.userService.updatePassword(resetToken.userId, hashedPassword);

      // Mark token as used
      await this.passwordResetRepository.markAsUsed(token);

      // Revoke all refresh tokens for this user
      await this.refreshTokenRepository.revokeAllForUser(resetToken.userId);

      return { success: true };
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.userService.findById(userId);

      // Verify current password
      const isPasswordValid = this.validatePassword(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new ForbiddenException('Current password is incorrect');
      }

      if (currentPassword === newPassword) {
        throw new ForbiddenException(
          'New password must be different from current password',
        );
      }

      // Validate password strength
      this.validatePasswordStrength(newPassword);
      const hashedPassword = await this.hashPassword(newPassword);
      await this.userService.updatePassword(userId, hashedPassword);

      // Revoke all refresh tokens except current one
      await this.refreshTokenRepository.revokeAllForUser(userId);

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Password change failed for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async generateTokens(user: any) {
    // Generate JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);

    const refreshToken = uuidv4();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_EXPIRATION_DAYS);

    // Save refresh token
    await this.refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRATION_SECONDS,
    };
  }

  private generateAccessToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: `${env.JWT_EXPIRATION_SECONDS}s`, // 15 minutes default
    });
  }

  private hashPassword(password: string): string {
    const saltRounds = env.BCRYPT_SALT_ROUNDS || 10;
    return bcrypt.hash(password, saltRounds);
  }

  private validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): boolean {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private validatePasswordStrength(password: string): void {
    const minLength = env.MIN_PASSWORD_LENGTH || 8;

    if (password.length < minLength) {
      throw new ForbiddenException(
        `Password must be at least ${minLength} characters long`,
      );
    }

    // Check for at least one uppercase letter, one lowercase letter and one number
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ForbiddenException(
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      );
    }
  }
}
