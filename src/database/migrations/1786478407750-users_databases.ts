import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersDatabases1786478407750 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table if not exists users_databases
        (
            user_id         integer                       not null,
            database_id     integer                       not null,
            role            text                          not null,
            created_at      timestamp with time zone      not null    default now(),
            deleted_at      timestamp with time zone,

            primary key (user_id, database_id)
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS users_databases;
    `);
  }
}
