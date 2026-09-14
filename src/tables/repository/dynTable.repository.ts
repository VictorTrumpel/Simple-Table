import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TableRowDto } from '../dto/GetTableDto';

export class DynTableRepository {
  private tableSpace = 'users_tablespace';

  constructor(private entityManager: EntityManager) {}

  addColumn(tableId: string, colId: string) {
    return this.entityManager.query(/*sql*/ `
      ALTER TABLE "${this.tableSpace}"."${tableId}"
      ADD COLUMN ${colId} text;
    `);
  }

  deleteColumn(tableId: string, colId: string) {
    return this.entityManager.query(/*sql*/ `
      ALTER TABLE "${this.tableSpace}"."${tableId}"
      DROP COLUMN ${colId};
    `);
  }

  async addRow(tableId: string, colIds: string[], colValues: unknown[]) {
    const [newRow] = await this.entityManager.query<TableRowDto[]>(
      /*sql*/ `
      INSERT INTO "${this.tableSpace}"."${tableId}" (${colIds.join(',')})
      VALUES (${colValues.map((_, idx) => `$${idx + 1}`).join(',')})
      RETURNING *
    `,
      colValues,
    );

    return newRow;
  }

  async getRows(tableId: string, rowIds: string[]) {
    return this.entityManager.query<{ id: string }[]>(
      /*sql*/ `
      SELECT * 
      FROM "${this.tableSpace}"."${tableId}"
      WHERE id = ANY($1::bigint[])
    `,
      [rowIds],
    );
  }

  async deleteRows(tableId: string, rowsIds: string[]) {
    const [deletedRows] = await this.entityManager.query<
      [{ id: string }[], number]
    >(
      /*sql*/ `
        DELETE FROM "${this.tableSpace}"."${tableId}"
        WHERE id = ANY($1::bigint[])
        RETURNING id;
      `,
      [rowsIds],
    );

    return deletedRows;
  }
}

@Injectable()
export class DynTableFactory {
  create(manager: EntityManager) {
    return new DynTableRepository(manager);
  }
}
