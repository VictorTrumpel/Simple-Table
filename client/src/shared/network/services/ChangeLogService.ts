import { network } from '../shared/network.js';
import type { Response } from '../shared/Response.js';
import type { AxiosError } from 'axios';
import type { GetChangeItemDTO } from '../dto/index.js';
import camelcaseKeys from 'camelcase-keys';

class ChangeLogService {
  async getTableChanges(
    tableId: string,
  ): Promise<Response<GetChangeItemDTO[]>> {
    try {
      const { data } = await network.get(`/changelog/table/${tableId}`);

      return { data: camelcaseKeys(data, { deep: true }), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getCellChanges(tableId: string, columnId: string, rowId: string) {
    try {
      const { data } = await network.get(
        `/changelog/cell/${tableId}/${rowId}/${columnId}`,
      );

      return { data: camelcaseKeys(data, { deep: true }), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const changeLogService = new ChangeLogService();
