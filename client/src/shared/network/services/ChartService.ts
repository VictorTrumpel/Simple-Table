import type { AxiosError } from 'axios';
import { network } from '../shared/network.js';
import type { Response } from '../shared/Response.js';

class ChartService {
  async addEmptyChartToDatabase(
    chartName: string,
    dbId: string,
  ): Promise<Response<string | number>> {
    try {
      const { data } = await network.post<string | number>(
        `/databases/${dbId}/add-chart`,
        {
          name: chartName,
          config: {},
          chartBindings: [],
        },
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const chartService = new ChartService();
