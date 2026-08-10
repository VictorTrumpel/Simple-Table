import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1786297240735 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table if not exists users
        (
            id         serial primary key,
            name       text      not null,
            email      text      not null,
            password_hash   text      not null,
            created_at timestamp with time zone not null default now(),
            updated_at timestamp with time zone not null default now()
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS users;
    `);
  }
}
