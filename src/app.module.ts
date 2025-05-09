import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@common/database/database.module';
import { AuthModule } from '@subdomain/auth/auth.module';
import { UserModule } from '@subdomain/user/user.module';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
  ],
})

export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      try {
        const dataSource = this.moduleRef.get(DataSource, { strict: false });

        const pendingMigrations = await dataSource.showMigrations();

        if (pendingMigrations) {
          this.logger.log('Running pending migrations...');
          await dataSource.runMigrations();
          this.logger.log('Migrations completed successfully!');
        } else {
          this.logger.log('No pending migrations.');
        }
      } catch (error) {
        this.logger.error('Failed to run migrations:', error);
      }
    }
  }
}
