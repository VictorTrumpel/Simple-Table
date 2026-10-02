import { randomUUID } from 'node:crypto';

export const createWssTicket = () => {
  return `wss_${randomUUID().replaceAll('-', '')}`;
};
