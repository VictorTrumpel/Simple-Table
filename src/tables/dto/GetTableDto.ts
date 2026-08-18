import type { ColumnType } from '../entities/table.entity';

export type TableColumnDto = {
  id: string;
  name: string;
  type: ColumnType;
};

export type TableRowDto = { id: string; data: Record<string, unknown> };

export type GetTableDto = {
  table: {
    id: string;
    name: string;
    databaseId: number;
    columns: TableColumnDto[];
    createdAt: Date;
  };
  rows: TableRowDto[];
};
