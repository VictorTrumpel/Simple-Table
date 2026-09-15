import { Injectable, NotFoundException } from '@nestjs/common';
import { AddColumnDto } from '../dto/AddColumnDto';
import { Table } from '../entities/table.entity';
import { createColId } from '../utils/createColId';
import { DataSource } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { EditColumnDto } from '../dto/EditColumnDto';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';

@Injectable()
export class TableColumnsService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
  ) {}

  async addColumn(addColumnDto: AddColumnDto) {
    return this.dataSource.transaction(async (manager) => {
      const { tableId } = addColumnDto;

      const tableMeta = await findTableOrTrhow(tableId, manager);

      const newColumn = {
        ...addColumnDto.column,
        id: createColId(),
      };

      const dynTableRepository = this.dynTableFactory.create(manager);

      await dynTableRepository.addColumn(tableMeta.id, newColumn.id);

      return manager.save(Table, {
        ...tableMeta,
        columns: [...tableMeta.columns, newColumn],
      });
    });
  }

  editColumn(editColumnDto: EditColumnDto) {
    return this.dataSource.transaction(async (manager) => {
      const { tableId, column: columnPatch } = editColumnDto;

      const tableMeta = await findTableOrTrhow(tableId, manager);

      const columnNeedToPatch = tableMeta.columns.find(
        (c) => c.id === columnPatch.id,
      );

      if (!columnNeedToPatch) {
        throw new NotFoundException({
          message: `Column with id: ${columnPatch.id} does not exist`,
        });
      }

      const updatedColumn = {
        ...columnNeedToPatch,
        ...columnPatch,
      };

      const updatedColumns = tableMeta.columns.map((c) => {
        if (c.id === updatedColumn.id) return updatedColumn;
        return c;
      });

      return manager.save(Table, {
        ...tableMeta,
        columns: updatedColumns,
      });
    });
  }

  deleteColumn(tableId: string, colId: string) {
    return this.dataSource.transaction(async (manager) => {
      const tableMeta = await findTableOrTrhow(tableId, manager);

      const columnNeedToDelete = tableMeta.columns.find((c) => c.id === colId);

      if (!columnNeedToDelete) {
        throw new NotFoundException({
          message: `Column with id: ${colId} does not exist`,
        });
      }

      const dynTableRepository = this.dynTableFactory.create(manager);

      await dynTableRepository.deleteColumn(
        tableMeta.id,
        columnNeedToDelete.id,
      );

      const updatedColumns = tableMeta.columns.filter(
        (c) => c.id !== columnNeedToDelete.id,
      );

      return manager.save(Table, {
        ...tableMeta,
        columns: updatedColumns,
      });
    });
  }
}
