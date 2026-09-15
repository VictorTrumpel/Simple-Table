import { EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Table } from '../entities/table.entity';

export const findTableOrTrhow = async (
  tableId: string,
  entityManager: EntityManager,
  needLock = true,
) => {
  const tableMeta = await entityManager.findOne(Table, {
    where: { id: tableId },
    ...(needLock ? { lock: { mode: 'pessimistic_write' } } : {}),
  });

  if (!tableMeta) {
    throw new NotFoundException({
      message: `Table with id: ${tableId} does not exist`,
    });
  }

  return tableMeta;
};
