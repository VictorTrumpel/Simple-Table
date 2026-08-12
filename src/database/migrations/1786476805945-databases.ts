import { MigrationInterface, QueryRunner } from 'typeorm';

export class Databases1786476805945 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table if not exists databases
        (
            id         serial primary key,
            name       text      not null,
            created_at timestamp with time zone not null default now(),
            deleted_at timestamp with time zone
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP TABLE IF EXISTS databases;
    `);
  }
}
