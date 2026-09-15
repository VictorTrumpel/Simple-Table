import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TableRowDto } from '../dto/GetTableDto';
import { Table } from '../entities/table.entity';
import { SetCellValueDto } from '../dto/SetCellValueDto';

export type ReadTableQuery = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  filterBy?: string;
  filterValue?: string;
};

export class DynTableRepository {
  private tableSpace = 'users_tablespace';

  constructor(private entityManager: EntityManager) {}

  createTable(table: Table) {
    return this.entityManager.query<Record<string, unknown>[]>(/*sql*/ `
      CREATE TABLE "${this.tableSpace}"."${table.id}" (
        id bigserial primary key, 
        sort_index bigserial not null, 
        sort_index_version bigint not null default 0,
        ${table.columns.map((col) => `${col.id} text`).join(',')}
        ${table.columns.length ? ',' : ''}
        deleted_at timestamp with time zone
      )
    `);
  }

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

  createSortIndex(tableId: string) {
    return this.entityManager.query<void>(/*sql*/ `
      CREATE INDEX IF NOT EXIST ${tableId}_order_idx
      ON ${this.tableSpace}.${tableId} (
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
      /*sql*/ `
        UPDATE "${this.tableSpace}"."${tableId}"
        SET "${columnId}" = $1
        WHERE id = $2 AND deleted_at IS NULL
        RETURNING *   
      `,
      [value, rowId],
    );

    return updatedRows;
  }

  readTable(
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

  private createFilteredQuery(
    tableId: string,
    queryParams: Pick<ReadTableQuery, 'filterBy' | 'filterValue'>,
  ) {
    const { filterBy, filterValue } = queryParams;

    const query = this.entityManager
      .createQueryBuilder()
      .from(`${this.tableSpace}.${tableId}`, 'row')
      .where('row.deleted_at is null');

    const normalizedFilterValue = filterValue?.trim();

    if (filterBy && normalizedFilterValue) {
      query.andWhere(`row."${filterBy}" ILIKE :searchValue`, {
        searchValue: `%${normalizedFilterValue}%`,
      });
    }

    return query;
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
      /*sql*/ `
        insert into "${this.tableSpace}"."${tableId}"
          (${updatedColIds.map((id) => `"${id}"`).join(', ')})
        values ${valuesSql}
        returning *
      `,
      parameters,
    );
  }
}

@Injectable()
export class DynTableFactory {
  create(manager: EntityManager) {
    return new DynTableRepository(manager);
  }
}
