import { EntityManager } from 'typeorm';
import { TableRowDto } from '../dto/GetTableDto';
import { Table } from './table.entity';
import { SetCellValueDto } from '../dto/SetCellValueDto';

export type ReadTableQuery = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  filterBy?: string;
  filterValue?: string;
};

export class UserTable {
  private userTableSpace = 'users_tablespace';

  constructor(private entityManager: EntityManager) {}

  async addCol(tableId: string, colId: string) {
    return this.entityManager.query<void>(`
      alter table "${this.userTableSpace}"."${tableId}"
      add column "${colId}" text
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

  async readTable(
    tableId: string,
    queryParams: ReadTableQuery,
  ): Promise<Record<string, unknown>[]> {
    const {
      page = 1,
      perPage = 100,
      sortBy,
      sortDir,
      filterBy,
      filterValue,
    } = queryParams;

    const query = this.createFilteredQuery(tableId, queryParams)
      .select('row.*')
      .skip((page - 1) * perPage)
      .take(perPage);

    if (sortBy && sortDir) {
      query.orderBy(`row."${sortBy}"`, sortDir === 'asc' ? 'ASC' : 'DESC');
    }

    const normalizedFilterValue = filterValue?.trim();

    if (filterBy && normalizedFilterValue) {
      query.andWhere(`row."${filterBy}" ILIKE :searchValue`, {
        searchValue: `%${normalizedFilterValue}%`,
      });
    }

    query.addOrderBy('row.sort_index', 'ASC');
    query.addOrderBy('row.sort_index_version', 'DESC');

    return query.getRawMany();
  }

  async getTotalRowsOfTable(
    tableId: string,
    queryParams: ReadTableQuery,
  ): Promise<number> {
    const result = await this.createFilteredQuery(tableId, queryParams)
      .select('COUNT(*)', 'total')
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
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

  async createSortIndex(tableId: string) {
    return this.entityManager.query<void>(`
      create index if not exists ${tableId}_order_idx
      on ${this.userTableSpace}.${tableId} (
        sort_index asc,
        sort_index_version desc
      )
    `);
  }

  async setCellValue(tableId: string, setCellValueDto: SetCellValueDto) {
    const { columnId, rowId, value } = setCellValueDto;

    const [updatedRows] = await this.entityManager.query<
      [Record<string, unknown>[], number]
    >(
      `
        update "${this.userTableSpace}"."${tableId}"
        set "${columnId}" = $1
        where id = $2 and deleted_at is null
        returning *   
      `,
      [value, rowId],
    );

    return updatedRows;
  }

  private createFilteredQuery(
    tableId: string,
    queryParams: Pick<ReadTableQuery, 'filterBy' | 'filterValue'>,
  ) {
    const { filterBy, filterValue } = queryParams;

    const query = this.entityManager
      .createQueryBuilder()
      .from(`${this.userTableSpace}.${tableId}`, 'row')
      .where('row.deleted_at is null');

    const normalizedFilterValue = filterValue?.trim();

    if (filterBy && normalizedFilterValue) {
      query.andWhere(`row."${filterBy}" ILIKE :searchValue`, {
        searchValue: `%${normalizedFilterValue}%`,
      });
    }

    return query;
  }
}
