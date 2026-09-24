import { Injectable, NotFoundException } from '@nestjs/common';
import { AddColumnDto } from '../dto/AddColumnDto';
import { Table } from '../entities/table.entity';
import { createColId } from '../utils/createColId';
import { DataSource } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { EditColumnDto } from '../dto/EditColumnDto';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';
import { ChangelogService } from 'src/changelog/changelog.service';

@Injectable()
export class TableColumnsService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
    private changelogService: ChangelogService,
  ) {}

  async addColumn(addColumnDto: AddColumnDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const { tableId } = addColumnDto;

      const tableMeta = await findTableOrTrhow(tableId, manager);

      const newColumn = {
        ...addColumnDto.column,
        id: createColId(),
      };

      const dynTableRepository = this.dynTableFactory.create(manager);

      await dynTableRepository.addColumn(tableMeta.id, newColumn.id);

      await this.changelogService.recordColWasAdded(
        manager,
        {
          tableId: tableMeta.id,
          colId: newColumn.id,
          afterColumn: {
            id: newColumn.id,
            name: newColumn.name,
            type: newColumn.type,
            enum: newColumn.enum,
          },
        },
        userId,
      );

      return manager.save(Table, {
        ...tableMeta,
        columns: [...tableMeta.columns, newColumn],
      });
    });
  }

  editColumn(editColumnDto: EditColumnDto, userId: string) {
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

      const newTable = manager.save(Table, {
        ...tableMeta,
        columns: updatedColumns,
      });

      await this.changelogService.recordColWasUpdated(
        manager,
        {
          tableId: tableMeta.id,
          colId: columnNeedToPatch.id,
          beforeColumn: {
            name: columnNeedToPatch.name,
            type: columnNeedToPatch.type,
            id: columnNeedToPatch.id,
            enum: null,
          },
          afterColumn: {
            name: updatedColumn.name,
            type: updatedColumn.type,
            id: updatedColumn.id,
            enum: null,
          },
        },
        userId,
      );

      return newTable;
    });
  }

  deleteColumn(tableId: string, colId: string, userId: string) {
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

      const newTable = manager.save(Table, {
        ...tableMeta,
        columns: updatedColumns,
      });

      await this.changelogService.recordColWasDeleted(
        manager,
        {
          tableId: tableMeta.id,
          colId: columnNeedToDelete.id,
          beforeColumn: {
            id: columnNeedToDelete.id,
            name: columnNeedToDelete.name,
            type: columnNeedToDelete.type,
            enum: null,
          },
        },
        userId,
      );

      return newTable;
    });
  }
}
