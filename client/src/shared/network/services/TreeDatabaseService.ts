import { network } from '../shared/network.js';
import type { Response } from '../shared/Response.js';
import type { GetTreeDatabaseDTO } from '../dto/index.js';
import type { AxiosError } from 'axios';

class TreeDatabaseService {
  async getTree(): Promise<Response<GetTreeDatabaseDTO[]>> {
    try {
      const { data } = await network.get('/databases/list');
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async addDatabase(dbName: string): Promise<Response<GetTreeDatabaseDTO[]>> {
    try {
      const { data } = await network.post('/databases/create', {
        name: dbName,
      });
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const treeDatabaseService = new TreeDatabaseService();
