import type { AxiosError } from "axios";

export type Response<T> =
  | { data: T; error: null }
  | { data: null; error: AxiosError };
