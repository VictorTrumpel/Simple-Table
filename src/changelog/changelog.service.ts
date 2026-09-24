import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  AddColRecordDto,
  ChangeCellDTO,
  ChangeRecord,
  DeleteColRecordDto,
  UpdatedColRecordDto,
  UpdateRowDto,
} from './dto/ChangeRecord';
import { TableWasAddedDto } from './dto/TableWasAddedDto';
import { ChangeRowItemDTO } from './dto/ChangeRecord';
import { ChangeEntity } from './dto/ChangeRecord';

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
      before: null,
      after: null,
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
    afterRow: ChangeRowItemDTO[],
    changeEntity: ChangeEntity,
  ) {
    const { userId, tableId, rowId } = changeEntity;

    const change: ChangeRecord = {
      changeType: 'add',
      before: null,
      after: null,
      beforeColumn: null,
      afterColumn: null,
      beforeRow: null,
      afterRow,
    };

    await this.recordRowChange(entityManager, userId, tableId, rowId, change);
  }

  async recordRowWasDeleted(
    entityManager: EntityManager,
    beforeRow: ChangeRowItemDTO[],
    changeEntity: ChangeEntity,
  ) {
    const { userId, tableId, rowId } = changeEntity;

    const change: ChangeRecord = {
      changeType: 'delete',
      before: null,
      after: null,
      beforeColumn: null,
      afterColumn: null,
      beforeRow: beforeRow,
      afterRow: null,
    };

    await this.recordRowChange(entityManager, userId, tableId, rowId, change);
  }

  async recordRowWasUpdated(
    entityManager: EntityManager,
    updateRowDto: UpdateRowDto,
    userId: string,
  ) {
    const { beforeRow, afterRow, tableId, rowId } = updateRowDto;

    const change: ChangeRecord = {
      changeType: 'update',
      before: null,
      after: null,
      beforeColumn: null,
      afterColumn: null,
      beforeRow,
      afterRow,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('row', $1, $2, $3, $4, $5, NOW())
    `,
      [userId, tableId, null, rowId, change],
    );
  }

  async recordCellWasChanged(
    entityManager: EntityManager,
    changeCellDto: ChangeCellDTO,
    userId: string,
  ) {
    const { before, after, columnId, rowId, tableId } = changeCellDto;

    const change: ChangeRecord = {
      changeType: 'delete',
      before,
      after,
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
        ('cell', $1, $2, $3, $4, $5, NOW())
    `,
      [userId, tableId, columnId, rowId, change],
    );
  }

  async recordColWasAdded(
    entityManager: EntityManager,
    addColRecordDto: AddColRecordDto,
    userId: string,
  ) {
    const { tableId, afterColumn, colId } = addColRecordDto;

    const change: ChangeRecord = {
      changeType: 'add',
      before: null,
      after: null,
      beforeColumn: null,
      afterColumn,
      beforeRow: null,
      afterRow: null,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('column', $1, $2, $3, NULL, $4, NOW())
    `,
      [userId, tableId, colId, change],
    );
  }

  async recordColWasDeleted(
    entityManager: EntityManager,
    deleteColRecordDto: DeleteColRecordDto,
    userId: string,
  ) {
    const { tableId, beforeColumn, colId } = deleteColRecordDto;

    const change: ChangeRecord = {
      changeType: 'delete',
      before: null,
      after: null,
      beforeColumn,
      afterColumn: null,
      beforeRow: null,
      afterRow: null,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('column', $1, $2, $3, NULL, $4, NOW())
    `,
      [userId, tableId, colId, change],
    );
  }

  async recordColWasUpdated(
    entityManager: EntityManager,
    updatedColRecordDto: UpdatedColRecordDto,
    userId: string,
  ) {
    const { tableId, beforeColumn, afterColumn, colId } = updatedColRecordDto;

    const change: ChangeRecord = {
      changeType: 'update',
      before: null,
      after: null,
      beforeColumn,
      afterColumn,
      beforeRow: null,
      afterRow: null,
    };

    await entityManager.query(
      /*sql*/ `
      INSERT INTO changelog 
        (target, user_id, table_id, column_id, row_id, change, changed_at)
      VALUES
        ('column', $1, $2, $3, NULL, $4, NOW())
    `,
      [userId, tableId, colId, change],
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

    const userIdMapUser = await this.getUserIdMapUser(userIds);

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

  async getCellChangeList(tableId: string, rowId: string, columnId: string) {
    const result = await this.entityManager.query<Record<string, unknown>[]>(
      /*sql*/ `
      SELECT * FROM changelog
      WHERE target = 'cell' AND table_id = $1 AND row_id = $2 AND column_id = $3
    `,
      [tableId, rowId, columnId],
    );

    const userIds = result.map(({ user_id }) => String(user_id));

    const userIdMapUser = await this.getUserIdMapUser(userIds);

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

  private async recordRowChange(
    entityManager: EntityManager,
    userId: string,
    tableId: string,
    rowId: string,
    change: ChangeRecord,
  ) {
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

  private async getUserIdMapUser(userIds: string[]) {
    const users = await this.entityManager.query<Record<string, unknown>[]>(
      /*sql*/ `
      SELECT * FROM users
      WHERE id = ANY($1::bigint[])  
    `,
      [userIds],
    );

    const userIdMapUser = new Map(users.map((u) => [u.id, u]));

    return userIdMapUser;
  }
}
