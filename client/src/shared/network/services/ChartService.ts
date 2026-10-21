import type { AxiosError } from 'axios';
import { network } from '../shared/network.js';
import type { Response } from '../shared/Response.js';
import type { GetChartBindingDTO } from '../dto/GetChartBindingDTO.js';

class ChartService {
  async getBindings(chartId: string): Promise<Response<GetChartBindingDTO[]>> {
    try {
      const { data } = await network.get<GetChartBindingDTO[]>(
        `/charts/${chartId}/bindings`,
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async addBinding(
    chartId: string,
    binding: { tableId: string; columnId: string; bindingKey: string },
  ): Promise<Response<unknown>> {
    try {
      const { data } = await network.post(
        `/charts/${chartId}/binding`,
        binding,
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

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
