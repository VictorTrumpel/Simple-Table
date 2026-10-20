import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChartDbFk1792523997277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        ALTER TABLE charts
        ADD COLUMN database_id integer not null default 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        ALTER TABLE charts
        DROP COLUMN database_id;
    `);
  }
}
