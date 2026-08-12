import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTables1786563519098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table if not exists tables
        (
            id          text                     not null primary key,
            name        text                     not null,
            database_id integer                  not null,
            columns     jsonb                    not null default '[]',
            created_at  timestamp with time zone not null default now(),
            deleted_at  timestamp with time zone
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS tables;
    `);
  }
}
