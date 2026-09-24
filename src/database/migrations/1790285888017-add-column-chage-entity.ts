import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnChageEntity1790285888017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
       ALTER TABLE changelog 
       ALTER COLUMN target SET NOT NULL,
       DROP CONSTRAINT changelog_target_check,
       ADD CONSTRAINT changelog_target_check
       CHECK (target IN ('cell', 'table', 'database', 'row', 'column'));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        ALTER TABLE changelog
        DROP CONSTRAINT changelog_target_check,
        ADD CONSTRAINT changelog_target_check
        CHECK (target IN ('cell', 'table', 'database', 'row'));
    `);
  }
}
