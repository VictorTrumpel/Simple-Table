import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export class DynTableRepository {
  private tableSpace = 'users_tablespace';

  constructor(private entityManager: EntityManager) {}

  addColumn(tableId: string, colId: string) {
    return this.entityManager.query(/*sql*/ `
      ALTER TABLE "${this.tableSpace}"."${tableId}"
      ADD COLUMN ${colId} text;
    `);
  }

  deleteColumn(tableId: string, colId: string) {
    return this.entityManager.query(/*sql*/ `
      ALTER TABLE "${this.tableSpace}"."${tableId}"
      DROP COLUMN ${colId};
    `);
  }
}

@Injectable()
export class DynTableFactory {
  create(manager: EntityManager) {
    return new DynTableRepository(manager);
  }
}
