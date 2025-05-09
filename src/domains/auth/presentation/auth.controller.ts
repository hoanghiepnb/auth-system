// src/domains/auth/presentation/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@subdomain/auth/infrastructure/guards/jwt-auth.guard';

import { AuthService } from '@subdomain//auth/application/auth.service';

import { JwtPayload } from '@subdomain/auth/domain/value-objects/jwt-payload';
import { Context } from '@common/decorators/context.decorator';
import { BaseResponse } from '@common/response/base.response';
import { RegisterDto } from '@subdomain/auth/application/dtos/register.dto';
import { LoginDto } from '@subdomain/auth/application/dtos/login.dto';
import { RefreshTokenDto } from '@subdomain/auth/application/dtos/refresh-token.dto';
import { ResetPasswordRequestDto } from '@subdomain/auth/application/dtos/reset-password-request.dto';
import { ResetPasswordConfirmDto } from '@subdomain/auth/application/dtos/reset-password-confirm.dto';
import { ChangePasswordDto } from '@subdomain/auth/application/dtos/change-password.dto';

@ApiTags('auth')
@Controller('auth')
@UsePipes(new ValidationPipe({ transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
  })
  async register(@Body() dto: RegisterDto): Promise<BaseResponse<any>> {
    const result = await this.authService.register(dto.email, dto.password);
    return new BaseResponse(1000, 'Register success', result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  async login(@Body() dto: LoginDto): Promise<BaseResponse<any>> {
    const result = await this.authService.login(dto.email, dto.password);
    return new BaseResponse(1000, 'Login success', result);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logout successful' })
  async logout(
    @Context() user: JwtPayload,
    @Body() body: RefreshTokenDto,
  ): Promise<BaseResponse<any>> {
    await this.authService.logout(user.sub, body.refreshToken);
    return new BaseResponse(1000, 'Logout success', null);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<BaseResponse<any>> {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return new BaseResponse(1000, 'Refresh token success', result);
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset requested',
  })
  async requestReset(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<BaseResponse<any>> {
    const result = await this.authService.requestPasswordReset(dto.email);
    return new BaseResponse(1000, 'Reset request accepted', result);
  }

  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset confirmed',
  })
  async resetPassword(
    @Body() dto: ResetPasswordConfirmDto,
  ): Promise<BaseResponse<any>> {
    const result = await this.authService.resetPassword(
      dto.token,
      dto.newPassword,
    );
    return new BaseResponse(1000, 'Password reset success', result);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Context() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ): Promise<BaseResponse<any>> {
    // Validate password confirmation
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const result = await this.authService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
    return new BaseResponse(1000, 'Password changed successfully', result);
  }
}
