import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { JwtAuthGuard } from '@subdomain//auth/infrastructure/guards/jwt-auth.guard';
import { UserService } from '@subdomain/user/application/user.service';
import { UpdateProfileDto } from '@subdomain/user/application/dtos/update-profile.dto';
import { UserResponseDto } from '@subdomain/user/application/dtos/user-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  async getProfile(@Req() req): Promise<UserResponseDto> {
    try {
      const user = await this.userService.findById(req.user.userId);
      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve profile');
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  async updateProfile(
    @Req() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    try {
      return await this.userService.updateProfile(
        req.user.userId,
        updateProfileDto,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to update profile');
    }
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(
    @Req() req,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.userService.deactivateAccount(req.user.userId);
      return {
        success: true,
        message: 'Account has been deactivated',
      };
    } catch (error) {
      throw new BadRequestException('Failed to deactivate account');
    }
  }

  @Post('account/reactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  @HttpCode(HttpStatus.OK)
  async reactivateAccount(
    @Req() req,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.userService.activateAccount(req.user.userId);
      return {
        success: true,
        message: 'Account has been reactivated',
      };
    } catch (error) {
      throw new BadRequestException('Failed to reactivate account');
    }
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  async getActivityLogs(@Req() req): Promise<any> {
    try {
      const activityLogs = await this.userService.getActivityLogs(
        req.user.userId,
      );
      return {
        lastLogin: activityLogs.lastLoginAt,
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve activity logs');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('accessBearer')
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userService.findById(id);
      return UserResponseDto.fromEntity(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user');
    }
  }
}
