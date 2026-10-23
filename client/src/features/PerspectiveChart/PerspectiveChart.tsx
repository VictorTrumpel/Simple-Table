import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { ChartViewer } from '@entity';
import { chartService, type GetChartDataDTO } from '@shared/network';

type Props = {
  chartId: string;
};

type ChartState = {
  chartId: string;
  data?: GetChartDataDTO;
  error?: boolean;
};

export const PerspectiveChart = ({ chartId }: Props) => {
  const [state, setState] = useState<ChartState | null>(null);

  useEffect(() => {
    setState(null);
    const controller = new AbortController();

    const loadData = async () => {
      const response = await chartService.getData(chartId, controller.signal);
      if (controller.signal.aborted) return;

      if (response.error) {
        setState({ chartId, error: true });
      } else {
        setState({ chartId, data: response.data ?? [] });
      }
    };

    void loadData();
    return () => controller.abort();
  }, [chartId]);

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
        <ChartViewer data={currentState.data} />
      ) : (
        <Typography color="text.secondary">Нет данных для графика</Typography>
      )}
    </Box>
  );
};
