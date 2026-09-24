import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { SetCellValueDto } from '../dto/SetCellValueDto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { pickColsFromRows } from '../utils/pickColsFromRows';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';
import { ChangelogService } from 'src/changelog/changelog.service';
import { ChangeRowItemDTO } from 'src/changelog/dto/ChangeRecord';

@Injectable()
export class TableCellService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
    private changelogService: ChangelogService,
  ) {}

  async setCellValue(
    tableId: string,
    setCellValue: SetCellValueDto,
    userId: string,
  ) {
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

      const [prevRow] = await dynTableRepository.getRows(table.id, [
        setCellValue.rowId,
      ]);

      if (!prevRow) {
        throw new NotFoundException({
          message: `row with id ${setCellValue.rowId} does not exist`,
        });
      }

      const updatedRows = await dynTableRepository.setCellValue(
        tableId,
        setCellValue,
      );

      const prevValue = prevRow[setCellValue.columnId];

      await this.changelogService.recordCellWasChanged(
        manager,
        {
          before: String(prevValue),
          after: setCellValue.value,
          columnId: setCellValue.columnId,
          rowId: setCellValue.rowId,
          tableId: table.id,
        },
        userId,
      );

      const colIdMapname = new Map(table.columns.map((c) => [c.id, c.name]));

      const beforeRow: ChangeRowItemDTO[] = table.columns.map((c) => {
        return {
          columnID: c.id,
          columnName: String(colIdMapname.get(c.id)),
          value: String(prevRow[c.id]),
        };
      });

      const rows = pickColsFromRows(table, updatedRows);

      const updatedRow = rows[0];

      if (!updatedRow) {
        throw new ConflictException({
          message: `row with id ${setCellValue.rowId} does not exist`,
        });
      }

      const afterRow: ChangeRowItemDTO[] = table.columns.map((c) => {
        return {
          columnID: c.id,
          columnName: String(colIdMapname.get(c.id)),
          value: String(updatedRow.data[c.id]),
        };
      });

      await this.changelogService.recordRowWasUpdated(
        manager,
        {
          rowId: setCellValue.rowId,
          tableId: table.id,
          beforeRow,
          afterRow,
        },
        userId,
      );

      return { rows };
    });
  }
}
