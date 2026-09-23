import { AddRowDto } from '../dto/AddRowDto';
import {
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DynTableFactory } from '../repository/dynTable.repository';
import { DeleteRowsDto } from '../dto/DeleteRowsDto';
import { findTableOrTrhow } from '../utils/findTableOrTrhow';
import { ChangeRowItemDTO } from 'src/changelog/dto/ChangeRecord';
import { ChangelogService } from 'src/changelog/changelog.service';

@Injectable()
export class TableRowsService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
    private changelogSerivce: ChangelogService,
  ) {}

  async addRow(addRowDto: AddRowDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const { tableId } = addRowDto;

      const tableMeta = await findTableOrTrhow(tableId, manager);

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

      const colIdMapName = new Map(
        tableColumns.map(({ id, name }) => [id, name]),
      );

      const changeRecord: ChangeRowItemDTO[] = updatedColIds.map((colId) => {
        const colName = colIdMapName.get(colId);
        const colValue = newRow[colId];
        return {
          columnID: colId,
          columnName: String(colName),
          value: String(colValue),
        };
      });

      await this.changelogSerivce.recordRowsWasAdded(manager, changeRecord, {
        userId,
        rowId: String(newRow.id),
        tableId: tableId,
      });

      return newRow;
    });
  }

  async deleteRows(tableId: string, deleteRowsDto: DeleteRowsDto) {
    return this.dataSource.transaction(async (manager) => {
      const { rowIds } = deleteRowsDto;

      const tableMeta = await findTableOrTrhow(tableId, manager);

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
}
