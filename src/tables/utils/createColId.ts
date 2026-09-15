import { randomUUID } from 'node:crypto';

export const createColId = () => {
  return `c_${randomUUID().replaceAll('-', '')}`;
};
