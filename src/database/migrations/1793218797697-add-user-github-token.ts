import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserGithubToken1793218797697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
      ALTER TABLE users
      ADD COLUMN github_token TEXT,
      ADD CONSTRAINT users_github_token_key UNIQUE (github_token);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
      ALTER TABLE users DROP COLUMN github_token;
    `);
  }
}
