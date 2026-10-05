import { Controller, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { RedisService } from 'src/redis/redis.service';
import { WebSocketServer as WsServer, WebSocket } from 'ws';
import { SetCellValueDto } from './dto/SetCellValueDto';
import { User } from 'src/users/entities/user.entity';
import { SetCellBusyDto } from './dto/SetCellBusyDto';

type TableId = string;

@Controller('table-events')
@WebSocketGateway({ path: '/ws/tables' })
export class TableGateway {
  @WebSocketServer()
  server!: WsServer;

  private logger = new Logger(RedisService.name);

  private mapTableIdClients: Map<TableId, WebSocket[]> = new Map();
  private mapClientToTicket: Map<WebSocket, string> = new Map();

  constructor(private redisService: RedisService) {}

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url ?? '/', 'https://_');

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

    this.mapClientToTicket.set(client, tableId);
    this.mapTableIdClients.set(tableId, [
      ...(this.mapTableIdClients.get(tableId) ?? []),
      client,
    ]);
  }

  handleDisconnect(client: WebSocket) {
    const tableId = this.mapClientToTicket.get(client);

    this.mapClientToTicket.delete(client);

    if (!tableId) {
      this.logger.error('Invalid tableId on disconnect wss://');
      return;
    }

    const currentClients = this.mapTableIdClients.get(tableId) ?? [];

    this.mapTableIdClients.set(
      tableId,
      currentClients.filter((c) => c !== client),
    );
  }

  broadcastSetTableValue(tableId: string, setCellValueDto: SetCellValueDto) {
    const clientsConnectedToTable = this.mapTableIdClients.get(tableId);

    if (!clientsConnectedToTable) return;

    clientsConnectedToTable.forEach((client) => {
      client.send(
        JSON.stringify({
          eventAction: 'set_cell_value',
          tableId,
          ...setCellValueDto,
        }),
      );
    });
  }

  broadcastUpdateTable(tableId: string) {
    const clientsConnectedToTable = this.mapTableIdClients.get(tableId);

    if (!clientsConnectedToTable) return;

    clientsConnectedToTable.forEach((client) => {
      client.send(
        JSON.stringify({
          eventAction: 'fetch_table',
          tableId,
        }),
      );
    });
  }

  broadcastSetCellBusy(
    user: User,
    tableId: string,
    setCellBusyDto: SetCellBusyDto,
    state: 'busy' | 'free',
  ) {
    const clientsConnectedToTable = this.mapTableIdClients.get(String(tableId));

    if (!clientsConnectedToTable) return;

    clientsConnectedToTable.forEach((client) => {
      client.send(
        JSON.stringify({
          eventAction: state === 'busy' ? 'set_cell_busy' : 'set_cell_free',
          user,
          ...setCellBusyDto,
        }),
      );
    });
  }
}
