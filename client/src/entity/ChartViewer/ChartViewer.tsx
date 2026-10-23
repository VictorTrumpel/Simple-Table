import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, useTheme } from '@mui/material';
import perspective, { type Client, type Table } from '@perspective-dev/client';
import { PerspectiveViewer } from '@perspective-dev/react';
import type { ViewerConfigUpdate } from '@perspective-dev/viewer';
import { disposeChartTable, initializePerspective } from './perspective.js';
import './ChartViewer.css';

type Props = {
  data: Record<string, unknown>[];
  config?: ViewerConfigUpdate;
  onConfigUpdate?: (config: ViewerConfigUpdate) => void;
};

type ViewerState = {
  data: Props['data'];
  client?: Client;
  error?: boolean;
};

const TABLE_NAME = 'chart';

export const ChartViewer = ({
  data,
  config: defaultConfig,
  onConfigUpdate,
}: Props) => {
  const [localConfig, setLocalConfig] = useState<ViewerConfigUpdate>(
    defaultConfig ?? {},
  );
  const [state, setState] = useState<ViewerState | null>();

  const theme = useTheme();

  const handleUpdateConfig = (config: ViewerConfigUpdate) => {
    setLocalConfig(config);
    onConfigUpdate?.(config);
  };

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

      table = await client.table(data, { name: TABLE_NAME });
      if (isActive) setState({ data, client });
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
      ) : currentState?.client ? (
        <PerspectiveViewer
          // Loading a Table again resets its config in @perspective-dev/react.
          // A Client can be reloaded safely; restore() selects its named table.
          client={currentState.client}
          style={{
            width: '100%',
            height: '100%',
            fontSize: theme.typography.body1.fontSize,
            fontFamily: theme.typography.fontFamily,
          }}
          onConfigUpdate={handleUpdateConfig}
          config={{ ...localConfig, table: TABLE_NAME }}
        />
      ) : (
        <CircularProgress aria-label="Подготовка графика" />
      )}
    </Box>
  );
};
