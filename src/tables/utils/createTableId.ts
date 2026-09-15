import { randomUUID } from 'node:crypto';

export const createTableId = () => {
  return `t_${randomUUID().replaceAll('-', '')}`;
};
