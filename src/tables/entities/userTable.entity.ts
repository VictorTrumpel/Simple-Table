import { EntityManager } from 'typeorm';
import { TableRowDto } from '../dto/GetTableDto';
import { Table } from './table.entity';

export class UserTable {
  private userTableSpace = 'users_tablespace';

  constructor(private entityManager: EntityManager) {}

  async addCol(tableId: string, colId: string) {
    return this.entityManager.query<void>(`
      alter table "${this.userTableSpace}"."${tableId}"
      add column "${colId}"
    `);
  }

  async deleteColFromUserTableQuery(tableId: string, colId: string) {
    return this.entityManager.query<void>(`
      alter table "${this.userTableSpace}"."${tableId}"
      drop column "${colId}"
    `);
  }

  async deleteRowsFromUserTableQuery(tableId: string, rowsIds: string[]) {
    const [deletedRows] = await this.entityManager.query<
      [{ id: string }[], number]
    >(
      `
        delete from "${this.userTableSpace}"."${tableId}"
        where id = any($1::bigint[])
        returning id;
      `,
      [rowsIds],
    );

    return deletedRows;
  }

  async addRowToUserTableQuery(
    tableId: string,
    updatedColIds: string[],
    colValues: unknown[],
  ) {
    const [newRow] = await this.entityManager.query<TableRowDto[]>(
      `
        insert into "${this.userTableSpace}"."${tableId}"
          (${updatedColIds.join(',')})
        values
          (${colValues.map((_, idx) => `$${idx + 1}`).join(',')})
        returning *
      `,
      colValues,
    );

    return newRow;
  }

  async addRowsToUserTableQuery(
    tableId: string,
    updatedColIds: string[],
    colValues: unknown[][],
  ) {
    const parameters: unknown[] = [];

    const valuesSql = colValues
      .map((row) => {
        const placeholders = row.map((value) => {
          parameters.push(value);
          return `$${parameters.length}`;
        });

        return `(${placeholders.join(', ')})`;
      })
      .join(', ');

    return this.entityManager.query<TableRowDto[]>(
      `
        insert into "${this.userTableSpace}"."${tableId}"
          (${updatedColIds.map((id) => `"${id}"`).join(', ')})
        values ${valuesSql}
        returning *
      `,
      parameters,
    );
  }

  async getUserTableQuery(tableId: string) {
    const tableRows = await this.entityManager.query<
      Record<string, unknown>[]
    >(`
      select * 
      from "${this.userTableSpace}"."${tableId}"
      where deleted_at is null
      order by sort_index
    `);

    return tableRows;
  }

  async createUserTableQuery(table: Table) {
    return this.entityManager.query<Record<string, unknown>[]>(`
      create table "${this.userTableSpace}"."${table.id}" (
        id bigserial primary key, 
        sort_index bigserial not null, 
        sort_index_version bigint not null default 0,
        ${table.columns.map((col) => `${col.id} text`).join(',')}
        ${table.columns.length ? ',' : ''}
        deleted_at timestamp with time zone
      )
    `);
  }

  async insertUserDataQuery() {}
}
