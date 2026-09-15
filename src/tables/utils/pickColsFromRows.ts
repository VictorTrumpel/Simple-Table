import { Table } from '../entities/table.entity';
import { TableRowDto } from '../dto/GetTableDto';

export const pickColsFromRows = (
  tableMeta: Table,
  rows: Record<string, unknown>[],
) => {
  const colsIds = tableMeta.columns.map((col) => col.id);

  const rowsMatchedWithColumns = rows.map((row) => {
    const matchedRow: TableRowDto = {
      id: String(row.id),
      data: {},
    };

    colsIds.forEach((colId) => {
      matchedRow.data[colId] = row[colId];
    });

    return matchedRow;
  });

  return rowsMatchedWithColumns;
};
