import { changeLogService } from "@shared/network";

export const useViewModel = () => {
  const fetchTableHistory = async (tableId: string) => {
    return await changeLogService.getTableChanges(tableId);
  };

  const fetchCellHistory = async (
    tableId: string,
    colId: string,
    rowId: string
  ) => {
    return await changeLogService.getCellChanges(tableId, colId, rowId);
  };

  return { fetchTableHistory, fetchCellHistory };
};
