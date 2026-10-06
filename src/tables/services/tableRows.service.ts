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
import { TableGateway } from '../tables.gateway';
import { ValidateCellService } from './validateCell.service';

@Injectable()
export class TableRowsService {
  constructor(
    private dataSource: DataSource,
    private dynTableFactory: DynTableFactory,
    private changelogSerivce: ChangelogService,
    private tableGateway: TableGateway,
    private validateCellService: ValidateCellService,
  ) {}

  async addRow(addRowDto: AddRowDto, userId: string, tableId: string) {
    const newRow = await this.dataSource.transaction(async (manager) => {
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

      const colIdMapCol = new Map(tableColumns.map((col) => [col.id, col]));

      for (const updatedColId of updatedColIds) {
        const updatedCol = colIdMapCol.get(updatedColId);
        const updatedColValue = addRowDto.data[updatedColId];

        if (!updatedCol) {
          throw new BadRequestException({
            message: `Unknown column id: ${updatedColId}`,
          });
        }

        const isValidValue = this.validateCellService.validateValue(
          updatedColValue,
          updatedCol.type,
          updatedCol.enum,
        );

        if (!isValidValue) {
          throw new BadRequestException({
            message: `Not valid value for column id: ${updatedCol.id} with type: ${updatedCol.type}`,
          });
        }
      }

      const colValues = updatedColIds.map((colId) => addRowDto.data[colId]);

      const dynTableRepository = this.dynTableFactory.create(manager);

      const newRow = await dynTableRepository.addRow(
        tableId,
        updatedColIds,
        colValues,
      );

      const changeRecord: ChangeRowItemDTO[] = updatedColIds.map((colId) => {
        const colName = colIdMapCol.get(colId)?.name;
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

    this.tableGateway.broadcastUpdateTable(tableId);

    return newRow;
  }

  async deleteRows(
    tableId: string,
    deleteRowsDto: DeleteRowsDto,
    userId: string,
  ) {
    const deletedRow = this.dataSource.transaction(async (manager) => {
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

      const colIdMapToName = new Map(
        tableMeta.columns.map((col) => [col.id, col.name]),
      );

      for (const row of existRows) {
        const rowChange: ChangeRowItemDTO[] = [];

        for (const columnID in row) {
          if (colIdMapToName.has(columnID)) {
            const columnName =
              colIdMapToName.get(columnID) ?? 'unknown_column_name';
            const value = String(row[columnID]);
            rowChange.push({ columnID, columnName, value });
          }
        }

        await this.changelogSerivce.recordRowWasDeleted(manager, rowChange, {
          tableId,
          rowId: String(row.id),
          userId,
        });
      }

      return { deletedCount: deletedRows.length };
    });

    this.tableGateway.broadcastUpdateTable(tableId);

    return deletedRow;
  }
}
