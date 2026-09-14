import { AddRowDto } from '../dto/AddRowDto';
import { Table } from '../entities/table.entity';
import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { DeleteRowsDto } from '../dto/DeleteRowsDto';

@Injectable()
export class TableRowsService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
  ) {}

  async addRow(addRowDto: AddRowDto) {
    return this.dataSource.transaction(async (manager) => {
      const { tableId } = addRowDto;

      const tableMeta = await this.findTableOrTrhow(tableId, manager);

      const tableColumns = tableMeta.columns;

      const allowedColumnsIds = new Set(tableColumns.map((col) => col.id));

      const updatedColIds = Object.keys(addRowDto.data);

      const invalidCols = updatedColIds.filter(
        (colId) => !allowedColumnsIds.has(colId),
      );

      if (invalidCols.length > 0) {
        throw new BadRequestException({
          message: 'Неизвестные колонки',
          columns: invalidCols,
        });
      }

      if (updatedColIds.length === 0) {
        throw new BadRequestException({
          message: 'Строка не содержит данных',
        });
      }

      const colValues = updatedColIds.map((colId) => addRowDto.data[colId]);

      const dynTableRepository = this.dynTableFactory.create(manager);

      const newRow = await dynTableRepository.addRow(
        tableId,
        updatedColIds,
        colValues,
      );

      return newRow;
    });
  }

  async deleteRows(tableId: string, deleteRowsDto: DeleteRowsDto) {
    return this.dataSource.transaction(async (manager) => {
      const { rowIds } = deleteRowsDto;

      const tableMeta = await this.findTableOrTrhow(tableId, manager);

      const dynTableRepository = this.dynTableFactory.create(manager);

      const existRows = await dynTableRepository.getRows(tableId, rowIds);

      const existRowsIdsSet = new Set(existRows.map((r) => r.id));

      const missingIds = rowIds.filter((id) => !existRowsIdsSet.has(id));

      if (missingIds.length > 0) {
        throw new NotFoundException({
          message: 'Удаляемых строк не существует',
          rows: missingIds,
        });
      }

      const deletedRows = await dynTableRepository.deleteRows(
        tableMeta.id,
        rowIds,
      );

      return { deletedCount: deletedRows.length };
    });
  }

  private async findTableOrTrhow(
    tableId: string,
    entityManager: EntityManager,
  ) {
    const tableMeta = await entityManager.findOne(Table, {
      where: { id: tableId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!tableMeta) {
      throw new NotFoundException({
        message: `Table with id: ${tableId} does not exist`,
      });
    }

    return tableMeta;
  }
}
