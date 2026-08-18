import type { GetColumnDTO } from './GetColumnDTO.js';
import type { GetRowInfoDTO } from './GetRowInfoDTO.js';

export type GetTableDataDTO = {
  table: {
    id: string;
    name: string;
    databaseId: 1;
    columns: GetColumnDTO[];
    createdAt: string;
    totalRows: number;
  };
  rows: GetRowInfoDTO[];
};
