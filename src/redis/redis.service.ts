import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { createWssTicket } from './utils/createWssTicket';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL,
      password: process.env.REDIS_PASSWORD,
    });
  }

  async onModuleInit(): Promise<void> {
    this.redisClient.on('error', (error) => {
      this.logger.error(error);
    });

    await this.redisClient.connect();
  }

  async onModuleDestroy() {
    if (this.redisClient.isOpen) {
      await this.redisClient.close();
    }
  }

  get(key: string) {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttl?: number) {
    await this.redisClient.set(key, value, { EX: ttl });
  }

  async createTicketForTableWssConnection(payload: {
    userId: string;
    tableId: string;
  }) {
    const { userId, tableId } = payload;

    const wssAccessTicket = createWssTicket();

    await this.redisClient.set(
      wssAccessTicket,
      JSON.stringify({ userId, tableId }),
      {
        EX: 30,
      },
    );

    return wssAccessTicket;
  }

  async getUserByConnectionTicket(
    ticket: string,
  ): Promise<null | { userId: string; tableId: string }> {
    const value = await this.redisClient.get(ticket);

    if (!value) return null;

    return JSON.parse(value) as { userId: string; tableId: string };
  }
}
