import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { SetCellValueDto } from '../dto/SetCellValueDto';
import { NotFoundException } from '@nestjs/common';
import { pickColsFromRows } from '../utils/pickColsFromRows';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';

@Injectable()
export class TableCellService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
  ) {}

  async setCellValue(tableId: string, setCellValue: SetCellValueDto) {
    return this.dataSource.transaction(async (manager) => {
      const table = await findTableOrTrhow(tableId, manager);

      const columnExist = table.columns.some(
        (c) => c.id === setCellValue.columnId,
      );

      if (!columnExist) {
        throw new NotFoundException({
          message: `column with id ${setCellValue.columnId} does not exist`,
        });
      }

      const dynTableRepository = this.dynTableFactory.create(manager);

      const updatedRows = await dynTableRepository.setCellValue(
        tableId,
        setCellValue,
      );

      const rows = pickColsFromRows(table, updatedRows);

      return { rows };
    });
  }
}
