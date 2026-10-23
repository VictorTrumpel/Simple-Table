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
import {
  AddChartBindingDialog,
  ChartBindingList,
  PerspectiveChart,
} from '@features';
import { useParams } from 'react-router-dom';
import {
  treeDatabaseService,
  type GetRoleDTO,
  type GetTreeChartDTO,
} from '@shared/network';

export const GraphWorkArea = () => {
  const { chartId } = useParams<{ chartId: string }>();

  return <GraphWorkAreaContent key={chartId} chartId={chartId} />;
};

const GraphWorkAreaContent = ({ chartId }: { chartId: string }) => {
  const [activePanel, setActivePanel] = useState<GraphMenuPanel>('chart');
  const [chart, setChart] = useState<GetTreeChartDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [role, setRole] = useState<GetRoleDTO>(null);
  const [isBindingDialogOpen, setIsBindingDialogOpen] = useState(false);
  const [bindingsVersion, setBindingsVersion] = useState(0);
  const canAddBinding = role === 'admin' || role === 'writer';

  useEffect(() => {
    let isActive = true;

    const loadChart = async () => {
      const response = await treeDatabaseService.getTree();

      if (!isActive) return;

      if (response.error) {
        setError('Не удалось загрузить график');
      } else {
        const database = response.data.find((item) =>
          item.charts?.some((chart) => String(chart.id) === chartId),
        );
        const selectedChart = database?.charts?.find(
          (item) => String(item.id) === chartId,
        );

        if (selectedChart && database) {
          setChart(selectedChart);
          setDbId(String(database.id));
          setRole(database.role);
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
              <PerspectiveChart
                chartId={chartId}
                settingsEnabled={role === 'admin' || role === 'writer'}
              />
            ) : (
              <Box
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                marginTop="10px"
                flex={1}
                overflow="auto"
              >
                {canAddBinding && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setIsBindingDialogOpen(true)}
                    sx={{ borderRadius: '8px' }}
                  >
                    Добавить ссылку на колонку
                  </Button>
                )}
                {dbId && (
                  <ChartBindingList
                    key={bindingsVersion}
                    chartId={chartId}
                    dbId={dbId}
                  />
                )}
              </Box>
            )}
          </Box>
        </>
      )}
      {canAddBinding && isBindingDialogOpen && dbId && (
        <AddChartBindingDialog
          chartId={chartId}
          dbId={dbId}
          onClose={() => setIsBindingDialogOpen(false)}
          onSuccess={() => setBindingsVersion((version) => version + 1)}
        />
      )}
    </Box>
  );
};
