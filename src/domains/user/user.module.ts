import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@subdomain/user/domain/entities/user.entity';
import { UserRepository } from '@subdomain/user/infrastructure/repositories/user.repository';
import { UserService } from '@subdomain/user/application/user.service';
import { UserController } from '@subdomain/user/presentation/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
