import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1746763578139 implements MigrationInterface {
    name = 'Migration1746763578139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isLocked"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lockUntil"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "loginAttempts"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastLoginAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarUrl"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "isRevoked"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "isUsed"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "user" ADD "is_locked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lock_until" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "login_attempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_login_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar_url" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phone_number" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "is_revoked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expires_at" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "is_used" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "expires_at" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "is_used"`);
        await queryRunner.query(`ALTER TABLE "password_resets" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "is_revoked"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar_url"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_login_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "login_attempts"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lock_until"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_locked"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "expiresAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "isUsed" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "password_resets" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "expiresAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "isRevoked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastLoginAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "loginAttempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lockUntil" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isLocked" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

}
