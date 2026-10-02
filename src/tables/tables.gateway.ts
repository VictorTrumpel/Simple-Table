import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { RedisService } from 'src/redis/redis.service';

import { WebSocketServer as WsServer, WebSocket } from 'ws';

@WebSocketGateway({ path: '/ws/tables' })
export class TableGateway {
  @WebSocketServer()
  server!: WsServer;

  private mapTableIdClient: Map<string, WebSocket[]> = new Map();

  constructor(private redisService: RedisService) {}

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url ?? '/', 'https://parse');

    const connectionTicket = url.searchParams.get('ticket');

    if (!connectionTicket) {
      client.close(1008, 'Invalid or expired connection ticket');
      return;
    }

    const connectionData =
      await this.redisService.getUserByConnectionTicket(connectionTicket);

    if (!connectionData) {
      client.close(1008, 'Invalid or expired connection ticket');
      return;
    }

    const { tableId } = connectionData;

    this.mapTableIdClient.set(tableId, [
      ...(this.mapTableIdClient.get(tableId) ?? []),
      client,
    ]);

    client.on('close', () => {
      const currentClients =
        this.mapTableIdClient.get(connectionData.tableId) ?? [];

      this.mapTableIdClient.set(
        connectionData.tableId,
        currentClients.filter((c) => c !== client),
      );
    });
  }
}
