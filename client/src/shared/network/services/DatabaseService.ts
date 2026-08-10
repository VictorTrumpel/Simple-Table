import { network } from '../shared/network.js';
import type { GetDbUserInfoDTO } from '../dto/index.js';
import type { Response } from '../shared/Response.js';
import type { AxiosError } from 'axios';
import type { GetRoleDTO } from '../dto/index.js';
import camelcaseKeys from 'camelcase-keys';

class DatabaseService {
  async fetchDbUsers(dbId: string): Promise<Response<GetDbUserInfoDTO[]>> {
    try {
      const { data } = await network.get<GetDbUserInfoDTO[]>(
        `/databases/${dbId}/users`,
      );

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getRole(dbId: string): Promise<Response<{ role: GetRoleDTO }>> {
    try {
      const { data } = await network.get<{ role: GetRoleDTO }>(
        `/databases/${dbId}/role`,
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async setRole(dbId: string, userId: string, role: string) {
    try {
      const { data } = await network.post<{ role: GetRoleDTO }>(
        `/databases/${dbId}/set-role`,
        {
          user_id: Number(userId),
          role,
        },
      );

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async deleteUser(dbId: string, userId: string) {
    try {
      const { data } = await network.post(`/databases/${dbId}/delete-user`, {
        user_id: Number(userId),
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const databaseService = new DatabaseService();
