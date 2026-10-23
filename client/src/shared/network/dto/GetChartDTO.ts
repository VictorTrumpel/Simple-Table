import type { ViewerConfigUpdate } from '@perspective-dev/viewer';

export type GetChartDTO = {
  id: number;
  name: string;
  databaseId: number;
  config: ViewerConfigUpdate;
};
