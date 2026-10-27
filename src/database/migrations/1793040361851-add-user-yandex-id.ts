import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserYandexId1793040361851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
      ALTER TABLE users
      ADD COLUMN yandex_id TEXT,
      ADD CONSTRAINT users_yandex_id_key UNIQUE (yandex_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
      ALTER TABLE users DROP COLUMN yandex_id;
    `);
  }
}
