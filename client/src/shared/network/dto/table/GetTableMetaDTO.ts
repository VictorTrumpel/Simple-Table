import type { GetColumnDTO } from './GetColumnDTO.js';

export type GetTableMetaDTO = {
  id: string;
  name: string;
  databaseId: number;
  columns: GetColumnDTO[];
  createdAt: string;
};
