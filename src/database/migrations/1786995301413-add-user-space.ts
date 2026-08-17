import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSpace1786995301413 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`create schema users_tablespace;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS users_tablespace;`);
  }
}
