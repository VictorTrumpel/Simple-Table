import { network } from '../shared/network.js';
import camelcaseKeys from 'camelcase-keys';
import type { GetUserDTO } from '../dto/GetUserDTO.js';
import type { CreateUserDTO } from '../dto/CreateUserDTO.js';
import type { Response } from '../shared/Response.js';
import type { AxiosError } from 'axios';

export class UserService {
  async login(payload: CreateUserDTO): Promise<Response<GetUserDTO>> {
    try {
      const { data } = await network.post<GetUserDTO>('/auth/login', payload);

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getAllUsers() {
    try {
      const { data } =
        await network.get<(GetUserDTO['userInfo'] & { id: string })[]>(
          '/users/list',
        );

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async getUserInfo() {
    try {
      const { data } = await network.get<GetUserDTO['userInfo']>('/users/info');

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }

  async registerUser(props: { email: string; name: string; password: string }) {
    try {
      const { data } = await network.post<GetUserDTO>('/auth/register', props);

      return { data: camelcaseKeys(data), error: null };
    } catch (error) {
      return { data: null, error: error as AxiosError };
    }
  }
}

export const userService = new UserService();
