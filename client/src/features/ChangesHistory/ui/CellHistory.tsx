import { Box, Typography, useTheme } from '@mui/material';
import { useRef, useEffect, useState } from 'react';
import { useLifecycles } from 'react-use';
import { CellSelectEvent } from '@features';
import { useViewModel } from '../hooks/useViewModel.js';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';

export const CellHistory = ({ tableId }: { tableId: string }) => {
  const { fetchCellHistory } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();
  const { palette } = useTheme();

  const containerList = useRef<HTMLDivElement | null>(null);

  const [cell, setCell] = useState<{ rowId: string; colId: string } | null>(
    null,
  );

  const [cellHistoryList, setCellHistoryList] = useState<
    {
      changeId: string;
      before: string;
      after: string;
      changedAt: string;
      user: { email: string; created_at: string };
    }[]
  >([]);

  const handleUpdateChangesHistory = async (e: Event) => {
    const customEvent = e as CustomEvent;

    const { id, field } = customEvent.detail;

    setCell({ rowId: id, colId: field });

    const response = await fetchCellHistory(tableId, field, id);

    if (response.error) {
      enqueueSnackbar('Не удалось получить историю изменения ячейки!', {
        variant: 'error',
      });
      return;
    }

    setCellHistoryList(response.data);
  };

  useLifecycles(
    () => {
      window.addEventListener(CellSelectEvent, handleUpdateChangesHistory);
    },
    () => {
      window.removeEventListener(CellSelectEvent, handleUpdateChangesHistory);
    },
  );

  const formatDate = (date: string) => {
    try {
      return format(new Date(date).getTime(), 'yyyy-mm-dd hh:mm:ss');
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const container = containerList.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [cellHistoryList]);

  if (!cell) return null;

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
      {cellHistoryList.map(({ changeId, changedAt, before, after, user }) => (
        <Box key={changeId}>
          {before} ➜ {after}
          <Typography fontSize="13px" color={palette.info.dark}>
            {user.email}
          </Typography>
          <Typography fontSize="11px" color={palette.grey[800]}>
            {formatDate(changedAt)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
