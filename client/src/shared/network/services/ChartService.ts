import type { AxiosError } from 'axios';
import type { ViewerConfigUpdate } from '@perspective-dev/viewer';
import { network } from '../shared/network.js';
import type { Response } from '../shared/Response.js';
import type { GetChartBindingDTO } from '../dto/GetChartBindingDTO.js';
import type { GetChartDataDTO } from '../dto/GetChartDataDTO.js';
import type { GetChartDTO } from '../dto/GetChartDTO.js';

class ChartService {
  async getChartMeta(
    chartId: string,
    signal?: AbortSignal,
  ): Promise<Response<GetChartDTO>> {
    try {
      const { data } = await network.get<GetChartDTO>(`/charts/${chartId}`, {
        signal,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async updateConfig(
    chartId: string,
    config: ViewerConfigUpdate,
  ): Promise<Response<unknown>> {
    try {
      const { data } = await network.put(`/charts/${chartId}/config`, {
        config,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getData(
    chartId: string,
    signal?: AbortSignal,
  ): Promise<Response<GetChartDataDTO>> {
    try {
      const { data } = await network.get<GetChartDataDTO>(
        `/charts/${chartId}/data`,
        { signal },
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteBinding(
    chartId: string,
    bindingId: number,
  ): Promise<Response<unknown>> {
    try {
      const { data } = await network.delete(
        `/charts/${chartId}/bindings/${bindingId}`,
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteChart(chartId: string): Promise<Response<unknown>> {
    try {
      const { data } = await network.delete(`/charts/${chartId}`);

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

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
