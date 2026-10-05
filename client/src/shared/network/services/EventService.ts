import type { AxiosError } from 'axios';
import { network } from '../shared/network.js';

class EventService {
  async setCellBusy(tableId: string, rowId: string, columnId: string) {
    try {
      const { data } = await network.put(`/tables/${tableId}/set-cell-busy`, {
        rowId: Number(rowId),
        columnId: columnId,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async setCellFree(tableId: string, rowId: string, columnId: string) {
    try {
      const { data } = await network.put(`/tables/${tableId}/set-cell-free`, {
        rowId: Number(rowId),
        columnId: columnId,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const eventService = new EventService();
