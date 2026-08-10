import type { AxiosError } from 'axios';
import { network } from '../shared/network.js';

class EventService {
  async setCellBusy(tableId: string, rowId: string, columnId: string) {
    try {
      const { data } = await network.post('/events/set-cell-busy', {
        row_id: Number(rowId),
        column_id: columnId,
        table_id: tableId,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async setCellFree(tableId: string, rowId: string, columnId: string) {
    try {
      const { data } = await network.post('/events/set-cell-free', {
        row_id: Number(rowId),
        column_id: columnId,
        table_id: tableId,
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const eventService = new EventService();
