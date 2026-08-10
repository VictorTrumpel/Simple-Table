import { useMemo } from "react";
import type { GetTableDataDTO } from "@shared/network";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";

export const useTableGrid = (tableInfo: GetTableDataDTO | null) => {
  const gridColumns: GridColDef[] = useMemo(() => {
    if (!tableInfo) return [];

    const columns = tableInfo.table.columns.map((col) => {
      return {
        field: col.id,
        headerName: col.name,
        editable: true,
        width: 150,
      };
    });

    return columns;
  }, [tableInfo]);

  const gridRows: GridRowsProp[] = useMemo(() => {
    if (!tableInfo) return [];

    const record: GridRowsProp[] = [];

    tableInfo.rows.forEach((row) => {
      record.push({
        id: row.id,
        ...row.data,
      } as unknown as GridRowsProp);
    });

    return record;
  }, [tableInfo]);

  return { gridColumns, gridRows };
};
