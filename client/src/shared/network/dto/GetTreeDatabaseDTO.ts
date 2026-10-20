import type { GetTreeTableDTO } from './GetTreeTableDTO.js';
import type { GetTreeChartDTO } from './GetTreeChartDTO.js';

export type GetTreeDatabaseDTO = {
  id: string;
  name: string;
  role: 'admin' | 'writer' | 'reader';
  tables: GetTreeTableDTO[];
  charts?: GetTreeChartDTO[];
};
