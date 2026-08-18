import { network } from '../shared/network.js';
import type { AxiosError } from 'axios';
import type { GetTableDataDTO } from '../dto/table/GetTableDataDTO.js';
import type { GetTableMetaDTO } from '../dto/table/GetTableMetaDTO.js';
import { type Response } from '../shared/Response.js';
import camelcaseKeys from 'camelcase-keys';

class TableService {
  async getTable(
    tableId: string,
    pagination: { page: number; pageSize: number },
    sortMeta: { field: string; sort: 'asc' | 'desc' | null | undefined },
    filterMeta: {
      filterCol: string | undefined;
      filterText: string | undefined;
    },
  ): Promise<Response<GetTableDataDTO>> {
    const { page, pageSize } = pagination;
    try {
      const { data } = await network.get(`/tables/${tableId}`, {
        params: {
          page,
          perPage: pageSize,
          sortBy: sortMeta.field || undefined,
          sortDir: sortMeta.sort || undefined,
          filterBy:
            filterMeta.filterCol && filterMeta.filterText
              ? filterMeta.filterCol
              : undefined,
          filterValue:
            filterMeta.filterText && filterMeta.filterCol
              ? filterMeta.filterText
              : undefined,
        },
      });
      return {
        data: { ...data, table: camelcaseKeys(data.table, { deep: true }) },
        error: null,
      };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getTableMeta(tableId: string): Promise<Response<GetTableMetaDTO>> {
    try {
      const { data } = await network.get(`/tables/${tableId}/info`);
      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async addEmptyTableToDatabase(tableName: string, dbId: string) {
    try {
      const { data } = await network.post(`/tables/create`, {
        name: tableName,
        databaseId: dbId,
        columns: [],
      });

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async addTableViaFile(dbId: string, tableName: string, file: File) {
    try {
      const formData = new FormData();
      formData.set('database_id', dbId);
      formData.set('table_name', tableName);
      formData.set('file', file);

      const { data } = await network.post(`/tables/import`, formData);

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteTable(tableId: string) {
    try {
      const { data } = await network.delete(`/tables/delete/${tableId}`);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async createColumn(tableId: string, column: { name: string; type: string }) {
    try {
      const { data } = await network.post(`/tables/add-column`, {
        tableId: tableId,
        column,
      });

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteColumn(tableId: string, columnId: string) {
    try {
      const { data } = await network.post('/tables/delete-column', {
        table_id: tableId,
        column_id: columnId,
      });

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async addRow(tableId: string, row: Record<string, unknown>) {
    try {
      const { data } = await network.post(`/tables/${tableId}/add-row`, {
        table_id: tableId,
        data: row,
      });

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteRow(tableId: string, rowId: string | number) {
    try {
      const { data } = await network.post(`/tables/${tableId}/delete-row`, {
        row_id: rowId,
      });

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async setTableCell(
    tableId: string,
    rowId: string,
    colId: string,
    value: unknown,
  ) {
    try {
      const { data } = await network.post(`/tables/${tableId}/set-cell-value`, {
        row_id: rowId,
        column_id: colId,
        value: value,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async editColInfo(
    tableId: string,
    col: { id: string; name: string; type: string; enum: string[] },
  ) {
    try {
      const { data } = await network.post(`/tables/edit-column`, {
        table_id: tableId,
        column: col,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getExport(id: string) {
    try {
      const response = await network.get(`/tables/${id}/export`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], {
        type: 'application/octet-stream',
      });

      return { data: blob, error: null };
    } catch (e) {
      return { data: null, error: e as AxiosError };
    }
  }
}

export const tableService = new TableService();
