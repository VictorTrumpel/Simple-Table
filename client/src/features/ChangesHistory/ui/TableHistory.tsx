import { Box } from '@mui/material';
import { useViewModel } from '../hooks/useViewModel.js';
import { useLifecycles } from 'react-use';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useRef } from 'react';
import {
  SuccessAddColumn,
  SuccessDeleteColumn,
  SuccessEditColumn,
  SuccessAddRowEvent,
  RowsDeleteEvent,
} from '@features';
import { ChangeView } from './ChangeView.js';
import type { GetChangeItemDTO } from '@shared/network';

export const TableHistory = ({ tableId }: { tableId: string }) => {
  const { fetchTableHistory } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const [chageList, setChangeList] = useState<GetChangeItemDTO[]>([]);

  const handleUpdateChangesHistory = async () => {
    const response = await fetchTableHistory(tableId);

    if (response.error) {
      enqueueSnackbar('Не удалось загрузить историю изменения таблицы!', {
        variant: 'error',
      });

      return;
    }

    setChangeList(response.data);
  };

  useLifecycles(
    () => {
      handleUpdateChangesHistory();

      window.addEventListener(SuccessAddColumn, handleUpdateChangesHistory);
      window.addEventListener(SuccessDeleteColumn, handleUpdateChangesHistory);
      window.addEventListener(SuccessEditColumn, handleUpdateChangesHistory);
      window.addEventListener(SuccessAddRowEvent, handleUpdateChangesHistory);
      window.addEventListener(RowsDeleteEvent, handleUpdateChangesHistory);
    },
    () => {
      window.removeEventListener(SuccessAddColumn, handleUpdateChangesHistory);
      window.removeEventListener(
        SuccessDeleteColumn,
        handleUpdateChangesHistory,
      );
      window.removeEventListener(RowsDeleteEvent, handleUpdateChangesHistory);
      window.removeEventListener(SuccessEditColumn, handleUpdateChangesHistory);
      window.removeEventListener(
        SuccessAddRowEvent,
        handleUpdateChangesHistory,
      );
    },
  );

  const containerList = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerList.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [chageList]);

  return (
    <Box
      ref={containerList}
      pt={1}
      flex="1"
      overflow="auto"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      {chageList.map((item) => (
        <ChangeView key={item.changeId} item={item} />
      ))}
    </Box>
  );
};
