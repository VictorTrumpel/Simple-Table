import type { GridRowId } from '@mui/x-data-grid';
import { tableActions } from '@shared/model';
import { useAppDispatch, useAppSelector } from '@shared/model';
import { tableService, eventService } from '@shared/network';
import type { PaginationMeta, SortMeta } from './useNavigationMeta.js';

export const useViewModel = () => {
  const dispatch = useAppDispatch();
  const selectedRowIds = useAppSelector((state) => state.table.selectedRowIds);

  const handleSetSelectedRows = (ids: Set<GridRowId>) => {
    dispatch(tableActions.setSelectedRows([...ids]));
  };

  const fetchTableData = async (
    tableId: string,
    paginationMeta: PaginationMeta,
    sort: SortMeta,
    filter: { filterCol: string | undefined; filterText: string | undefined },
  ) => {
    return await tableService.getTable(tableId, paginationMeta, sort, filter);
  };

  const updateTableCell = async (
    tableId: string,
    rowId: string,
    colId: string,
    value: unknown,
  ) => {
    return await tableService.setTableCell(tableId, rowId, colId, value);
  };

  const deleteRows = async (tableId: string, rowsIds: (number | string)[]) => {
    return await tableService.deleteRows(tableId, rowsIds);
  };

  const handleCellFocus = (tableId: string, rowId: string, colId: string) => {
    eventService.setCellBusy(tableId, rowId, colId);
  };

  const handleCellFree = (tableId: string, rowId: string, colId: string) => {
    eventService.setCellFree(tableId, rowId, colId);
  };

  return {
    selectedRowIds,
    fetchTableData,
    handleSetSelectedRows,
    updateTableCell,
    deleteRows,
    handleCellFocus,
    handleCellFree,
  };
};
