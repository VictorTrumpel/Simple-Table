import { useState } from 'react';
import { useViewModel } from './useViewModel.js';
import type { GridRowId } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { RowsDeleteEvent } from '../events/RowsDeleteEvent.js';

export const useRowChange = (tableId: string) => {
  const { updateTableCell, deleteRows } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedRows, setSelectedRows] = useState<Set<GridRowId>>(new Set());

  const handleSelectRows = (selectedSet: Set<GridRowId>) => {
    setSelectedRows(selectedSet);
  };

  const handleRowUpdate = async (newRowObj: unknown, oldRowObj: unknown) => {
    const newRow = newRowObj as Record<string, unknown>;
    const oldRow = oldRowObj as Record<string, unknown>;

    const colNames = Object.keys(newRow);

    for (const colId of colNames) {
      if (newRow[colId] === oldRow[colId]) continue;

      const response = await updateTableCell(
        tableId,
        newRow.id as string,
        colId,
        newRow[colId],
      );

      if (response.error) {
        enqueueSnackbar('Ошибка изменения ячейки!', { variant: 'error' });
        return oldRow;
      }
    }

    return newRow as Record<string, unknown>;
  };

  const handleDeleteRows = async () => {
    const response = await deleteRows(tableId, [...selectedRows]);

    setSelectedRows(new Set());

    if (response.error) {
      enqueueSnackbar('Не все строки были удалены успешно!', {
        variant: 'error',
      });

      return;
    }

    if (!response.error) {
      enqueueSnackbar('Строки успешно удалены!', {
        variant: 'success',
      });
    }

    window.dispatchEvent(new Event(RowsDeleteEvent));
  };

  return { selectedRows, handleSelectRows, handleRowUpdate, handleDeleteRows };
};
