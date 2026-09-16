import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHistorySave1789591957989 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        CREATE TABLE IF NOT EXISTS changelog (
            change_id  bigserial primary key,
            target     text                     NOT NULL CHECK (target IN ('cell', 'table', 'database')),
            user_id    integer                  NOT NULL,
            table_id   text,
            column_id  text,
            row_id     bigint,
            change     jsonb                    NOT NULL DEFAULT '{}',
            changed_at timestamp with time zone NOT NULL
        );

        CREATE INDEX changelog_target_table_column_row_idx
            ON changelog (target, table_id, column_id, row_id);

        CREATE INDEX changelog_changed_at_idx
            ON changelog (changed_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        DROP TABLE IF EXISTS changelog;
    `);
  }
}
