import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MenuGraphWork, type GraphMenuPanel } from '@entity';
import { useParams } from 'react-router-dom';
import { treeDatabaseService, type GetTreeChartDTO } from '@shared/network';

export const GraphWorkArea = () => {
  const { chartId } = useParams<{ chartId: string }>();

  return <GraphWorkAreaContent key={chartId} chartId={chartId} />;
};

const GraphWorkAreaContent = ({ chartId }: { chartId: string }) => {
  const [activePanel, setActivePanel] = useState<GraphMenuPanel>('chart');
  const [chart, setChart] = useState<GetTreeChartDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadChart = async () => {
      const response = await treeDatabaseService.getTree();

      if (!isActive) return;

      if (response.error) {
        setError('Не удалось загрузить график');
      } else {
        const selectedChart = response.data
          .flatMap((database) => database.charts ?? [])
          .find((item) => String(item.id) === chartId);

        if (selectedChart) {
          setChart(selectedChart);
        } else {
          setError('График не найден');
        }
      }

      setIsLoading(false);
    };

    void loadChart();

    return () => {
      isActive = false;
    };
  }, [chartId]);

  return (
    <Box
      maxHeight="100%"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      paddingLeft={2}
      paddingRight={2}
      paddingBottom={2}
    >
      {isLoading ? (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress aria-label="Загрузка графика" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box className="GraphWorkArea-header" marginTop="3px">
            <Typography variant="h6">{chart?.name}</Typography>

            <MenuGraphWork
              activeValue={activePanel}
              onSelectTab={setActivePanel}
            />
          </Box>

          <Box
            role="tabpanel"
            id={`graph-panel-${activePanel}`}
            aria-labelledby={`graph-tab-${activePanel}`}
            flex={1}
            minHeight={0}
            display="flex"
            overflow="auto"
            marginTop="10px"
          >
            {activePanel === 'chart' ? (
              <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="text.secondary">
                  Нет данных для графика
                </Typography>
              </Box>
            ) : (
              <Box
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                marginTop="10px"
                flex={1}
                overflow="auto"
              >
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: '8px' }}
                >
                  Добавить ссылку на колонку
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};
