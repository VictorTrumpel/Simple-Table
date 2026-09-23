import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ChangeRecord } from './dto/ChangeRecord';
import { TableWasAddedDto } from './dto/TableWasAddedDto';
import { ChangeRowItemDTO } from './dto/ChangeRecord';

@Injectable()
export class ChangelogService {
  constructor(private readonly entityManager: EntityManager) {}

  async recordTableWasAdded(
    entityManager: EntityManager,
    tableWasAddedDto: TableWasAddedDto,
  ) {
    const { userId, tableId } = tableWasAddedDto;

    const change: ChangeRecord = {
      changeType: 'add',
      beforeColumn: null,
      afterColumn: null,
      beforeRow: null,
      afterRow: null,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('table', $1, $2, NULL, NULL, $3, NOW())
    `,
      [userId, tableId, change],
    );
  }

  async recordRowsWasAdded(
    entityManager: EntityManager,
    addedRowsDto: ChangeRowItemDTO[],
    changeEntity: {
      userId: string;
      tableId: string;
      rowId: string;
    },
  ) {
    const { userId, tableId, rowId } = changeEntity;

    const change: ChangeRecord = {
      changeType: 'add',
      beforeColumn: null,
      afterColumn: null,
      beforeRow: null,
      afterRow: addedRowsDto,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('row', $1, $2, NULL, $3, $4, NOW())
    `,
      [userId, tableId, rowId, change],
    );
  }

  async getTableChangeList(tableId: string) {
    const result = await this.entityManager.query<Record<string, unknown>[]>(
      /*sql*/ `
      SELECT * FROM changelog
      WHERE target != 'cell' AND table_id = $1 AND target != 'database'
    `,
      [tableId],
    );

    const userIds = result.map(({ user_id }) => String(user_id));

    const users = await this.entityManager.query<Record<string, unknown>[]>(
      /*sql*/ `
      SELECT * FROM users
      WHERE id = ANY($1::bigint[])  
    `,
      [userIds],
    );

    const userIdMapUser = new Map(users.map((u) => [u.id, u]));

    const chageListWithUser = result.map(
      ({ user_id, change, target, ...changeItem }) => {
        return {
          ...changeItem,
          ...(change ?? {}),
          user: userIdMapUser.get(user_id) ?? null,
          changedEntity: target,
        };
      },
    );

    return chageListWithUser;
  }
}
