import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { ViewerConfigUpdate } from '@perspective-dev/viewer';
import { useSnackbar } from 'notistack';
import { ChartViewer } from '@entity';
import {
  chartService,
  type GetChartDataDTO,
  type GetChartDTO,
} from '@shared/network';

type Props = {
  chartId: string;
  settingsEnabled?: boolean;
};

type ChartState = {
  chartId: string;
  data?: GetChartDataDTO;
  config?: GetChartDTO['config'];
  error?: boolean;
};

export const PerspectiveChart = ({ chartId, settingsEnabled = true }: Props) => {
  const [state, setState] = useState<ChartState | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setState(null);
    const controller = new AbortController();

    const loadData = async () => {
      const [response, metadata] = await Promise.all([
        chartService.getData(chartId, controller.signal),
        chartService.getChartMeta(chartId, controller.signal),
      ]);

      if (controller.signal.aborted) return;

      if (response.error || metadata.error || !metadata.data) {
        setState({ chartId, error: true });
      } else {
        setState({
          chartId,
          data: response.data ?? [],
          config: metadata.data.config,
        });
      }
    };

    loadData();

    return () => controller.abort();
  }, [chartId]);

  const handleConfigUpdate = async (config: ViewerConfigUpdate) => {
    const response = await chartService.updateConfig(chartId, config);

    if (response.error) {
      enqueueSnackbar('Не удалось сохранить настройки графика!', {
        variant: 'error',
      });
    }
  };

  const currentState = state?.chartId === chartId ? state : null;

  return (
    <Box
      flex={1}
      minWidth={0}
      minHeight={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {!currentState ? (
        <CircularProgress aria-label="Загрузка данных графика" />
      ) : currentState.error ? (
        <Alert severity="error">Не удалось загрузить данные графика</Alert>
      ) : currentState.data?.length ? (
        <ChartViewer
          data={currentState.data}
          config={currentState.config}
          settingsEnabled={settingsEnabled}
          onConfigUpdate={settingsEnabled ? handleConfigUpdate : undefined}
        />
      ) : (
        <Typography color="text.secondary">Нет данных для графика</Typography>
      )}
    </Box>
  );
};
