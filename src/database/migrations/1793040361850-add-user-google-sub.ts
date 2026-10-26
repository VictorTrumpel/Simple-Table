import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserGoogleSub1793040361850 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        ALTER TABLE users
        ADD COLUMN google_sub TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        ALTER TABLE charts
        DROP COLUMN google_sub;
    `);
  }
}
