import { useEffect, useRef, useState } from 'react';
import { Alert, Box, CircularProgress, useTheme } from '@mui/material';
import perspective, { type Client, type Table } from '@perspective-dev/client';
import { PerspectiveViewer } from '@perspective-dev/react';
import { disposeChartTable, initializePerspective } from './perspective.js';
import './ChartViewer.css';

type Props = {
  data: Record<string, unknown>[];
};

type ViewerState = {
  data: Props['data'];
  table?: Table;
  error?: boolean;
};

export const ChartViewer = ({ data }: Props) => {
  const [state, setState] = useState<ViewerState | null>(null);

  const theme = useTheme();

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setState(null);
    let isActive = true;
    let client: Client | undefined;
    let table: Table | undefined;

    const loadTable = async () => {
      await initializePerspective();

      if (!isActive) return;

      client = await perspective.worker();
      if (!isActive) return;

      table = await client.table(data);
      if (isActive) setState({ data, table });
    };

    const ready = loadTable()
      .catch(async () => {
        if (isActive) setState({ data, error: true });
        if (client) {
          const failedClient = client;
          client = undefined;
          await disposeChartTable(failedClient, table);
        }
      })
      .catch((error: unknown) => {
        console.error('Не удалось освободить ресурсы графика', error);
      });

    return () => {
      isActive = false;

      ready
        .then(async () => {
          if (client) await disposeChartTable(client, table);
        })
        .catch((error: unknown) => {
          console.error('Не удалось освободить ресурсы графика', error);
        });
    };
  }, [data]);

  const currentState = state?.data === data ? state : null;

  return (
    <Box
      ref={chartRef}
      flex={1}
      alignSelf="stretch"
      minWidth={0}
      minHeight={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      borderRadius="8px"
    >
      {currentState?.error ? (
        <Alert severity="error">Не удалось отобразить график</Alert>
      ) : currentState?.table ? (
        <PerspectiveViewer
          client={currentState.table}
          style={{
            width: '100%',
            height: '100%',
            fontSize: theme.typography.body1.fontSize,
            fontFamily: theme.typography.fontFamily,
          }}
          // onConfigUpdate={console.log}
          config={{
            plugin: 'Y Line',
            settings: true,
          }}
        />
      ) : (
        <CircularProgress aria-label="Подготовка графика" />
      )}
    </Box>
  );
};
