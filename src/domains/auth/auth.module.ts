import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '@common/config/env';
import { AuthService } from '@subdomain/auth/application/auth.service';
import { JwtStrategy } from '@subdomain/auth/application/strategy/jwt.strategy';
import { UserModule } from '@subdomain/user/user.module';
import { RefreshTokenRepository } from '@subdomain/auth/infrastructure/repositories/refresh-token.repository';
import { PasswordResetRepository } from '@subdomain/auth/infrastructure/repositories/password-reset.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '@subdomain/auth/domain/entities/refresh-token.entity';
import { PasswordResetEntity } from '@subdomain/auth/domain/entities/password-reset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity, PasswordResetEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: env.JWT_EXPIRES_IN,
      },
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenRepository,
    PasswordResetRepository,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
