import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import {
  DeleteBindingAction,
  SuccessDeleteBinding,
} from '../DeleteBindingAction/index.js';
import { FaTable } from 'react-icons/fa6';
import { TbColumns1 } from 'react-icons/tb';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import {
  chartService,
  databaseService,
  type GetChartBindingDTO,
  type GetRoleDTO,
} from '@shared/network';
import type { GetTableMetaDTO } from '../../shared/network/dto/table/GetTableMetaDTO.js';

type Props = {
  chartId: string;
  dbId: string;
};

export const ChartBindingList = ({ chartId, dbId }: Props) => {
  const [bindings, setBindings] = useState<GetChartBindingDTO[]>([]);
  const [tables, setTables] = useState<GetTableMetaDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [role, setRole] = useState<GetRoleDTO>(null);
  const canDeleteBinding = role === 'admin' || role === 'writer';

  useEffect(() => {
    let isActive = true;

    const loadBindings = async () => {
      const [bindingsResponse, tablesResponse, roleResponse] = await Promise.all([
        chartService.getBindings(chartId),
        databaseService.getTables(dbId),
        databaseService.getRole(dbId),
      ]);

      if (!isActive) return;

      setRole(roleResponse.error ? null : roleResponse.data.role);

      if (bindingsResponse.error || tablesResponse.error) {
        setHasError(true);
      } else {
        setHasError(false);
        setBindings(bindingsResponse.data);
        setTables(tablesResponse.data);
      }
      setIsLoading(false);
    };

    void loadBindings();
    window.addEventListener(SuccessDeleteBinding, loadBindings);
    return () => {
      isActive = false;
      window.removeEventListener(SuccessDeleteBinding, loadBindings);
    };
  }, [chartId, dbId]);

  if (isLoading) {
    return (
      <CircularProgress
        size={24}
        sx={{ mt: 2 }}
        aria-label="Загрузка ссылок на колонки"
      />
    );
  }

  if (hasError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Не удалось загрузить ссылки на колонки
      </Alert>
    );
  }

  return (
    <List
      aria-label="Ссылки на колонки"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        mt: 1,
      }}
    >
      {bindings.map((binding) => {
        const table = tables.find((item) => item.id === binding.tableId);
        const column = table?.columns.find(
          (item) => item.id === binding.columnId,
        );

        return (
          <ListItem
            key={binding.id}
            sx={{
              background: (theme) => theme.palette.grey[200],
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: canDeleteBinding
                ? 'repeat(3, minmax(0, 1fr)) auto'
                : 'repeat(3, minmax(0, 1fr))',
              columnGap: 2,
              alignItems: 'center',
              py: 1,
            }}
          >
            <Box
              component="span"
              display="inline-flex"
              alignItems="center"
              gap={1}
              minWidth={0}
            >
              <FaTable style={{ flexShrink: 0 }} />
              <Typography component="span" sx={{ overflowWrap: 'anywhere' }}>
                Таблица: {table?.name ?? 'Таблица недоступна'}
              </Typography>
            </Box>
            <Box
              component="span"
              display="inline-flex"
              alignItems="center"
              gap={1}
              minWidth={0}
            >
              <TbColumns1 fill="currentColor" style={{ flexShrink: 0 }} />
              <Typography component="span" sx={{ overflowWrap: 'anywhere' }}>
                Колонка: {column?.name ?? 'Колонка недоступна'}
              </Typography>
            </Box>
            <Box
              component="span"
              display="inline-flex"
              alignItems="center"
              gap={1}
              minWidth={0}
            >
              <MdDriveFileRenameOutline style={{ flexShrink: 0 }} />
              <Typography component="span" sx={{ overflowWrap: 'anywhere' }}>
                Имя: {binding.bindingKey}
              </Typography>
            </Box>
            {canDeleteBinding && (
              <DeleteBindingAction
                chartId={chartId}
                id={binding.id}
                bindingKey={binding.bindingKey}
              />
            )}
          </ListItem>
        );
      })}
    </List>
  );
};
