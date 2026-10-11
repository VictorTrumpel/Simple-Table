import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCharts1791749540329 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        CREATE TABLE charts (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name text NOT NULL,
            config jsonb NOT NULL DEFAULT '{}'
        );

        CREATE TABLE chart_bindings (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

            chart_id bigint NOT NULL
                REFERENCES charts(id) ON DELETE CASCADE,

            table_id text NOT NULL
                REFERENCES tables(id) ON DELETE RESTRICT,

            column_id text NOT NULL,

            binding_key text NOT NULL,

            UNIQUE (chart_id, binding_key)
        );

        CREATE INDEX chart_bindings_source_idx
            ON chart_bindings (table_id, column_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `
        DROP TABLE chart_bindings;
        DROP TABLE charts;
    `);
  }
}
