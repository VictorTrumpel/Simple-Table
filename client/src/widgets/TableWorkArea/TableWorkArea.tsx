import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { MenuTableWork } from '@entity';
import { TableEditor } from '@features';
import { useLocation } from 'react-router-dom';
import { useViewModel } from './hooks/useViewModel.js';
import {
  DeleteColumnAction,
  TableColumnList,
  EditColumnAction,
  ChangesHistory,
} from '@features';
import { useSnackbar } from 'notistack';
import type { TableMenuPanel } from '@shared/model';
import { getTableIdFromPageUrl } from '@shared/utils';
import type { GetTableMetaDTO } from 'src/shared/network/dto/table/GetTableMetaDTO';
import type { GetRoleDTO } from '@shared/network';

export const TableWorkArea = () => {
  const {
    isActiveMenuHistory,
    activePanel,
    getTableInfo,
    setTableMenuActivePanel,
    checkRole,
    handleTogleMenuHistory,
    handleDownload,
  } = useViewModel();

  const { enqueueSnackbar } = useSnackbar();

  const location = useLocation();

  const [role, setRole] = useState<GetRoleDTO | null>(null);
  const [tableMeta, setTableMeta] = useState<GetTableMetaDTO | null>(null);

  const handleUpdateTableInfo = async () => {
    const path = location.pathname;

    const tableId = getTableIdFromPageUrl(path);

    if (!tableId) return;

    const response = await getTableInfo(tableId);

    if (response.error) {
      return;
    }

    setTableMeta(response.data);

    const dbId = response.data.databaseId;

    const roleResponse = await checkRole(String(dbId));

    if (roleResponse.error) {
      enqueueSnackbar('Не удалось установить рлоль!', { variant: 'error' });
      return;
    }

    setRole(roleResponse.data.role);
  };

  const handleSelectTab = (tab: TableMenuPanel) => {
    setTableMenuActivePanel(tab);
  };

  useEffect(() => {
    handleUpdateTableInfo();
  }, [location]);

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
      <Box className="TableWorkArea-header" marginTop="3px">
        <Typography variant="h6">
          {tableMeta?.name || 'Неизвестная таблица'}
        </Typography>

        <MenuTableWork
          activeHistoryMenu={isActiveMenuHistory}
          activeValue={activePanel}
          onSelectTab={handleSelectTab}
          onToggleMenuHistory={handleTogleMenuHistory}
          onExcelDownload={() => handleDownload(tableMeta?.id)}
        />
      </Box>

      {tableMeta && (
        <>
          <Box
            flex="1"
            display="flex"
            height="100%"
            overflow="hidden"
            marginTop="10px"
          >
            {activePanel !== 'columns' && (
              <Box flex="1" height="100%" overflow="hidden">
                <TableEditor
                  role={role}
                  key={tableMeta.id}
                  tableId={tableMeta.id}
                />
              </Box>
            )}

            {activePanel === 'columns' && (
              <Box
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                marginTop="10px"
                flex={1}
                overflow="auto"
              >
                {role === 'admin' && (
                  <EditColumnAction tableId={tableMeta.id} view="CREATE" />
                )}

                <TableColumnList
                  key={tableMeta.id}
                  tableId={tableMeta.id}
                  itemActionSlot={(column) => (
                    <>
                      {role === 'admin' && (
                        <EditColumnAction
                          view="EDIT"
                          tableId={tableMeta.id}
                          {...column}
                        />
                      )}
                      {role === 'admin' && (
                        <DeleteColumnAction
                          tableId={tableMeta.id}
                          {...column}
                        />
                      )}
                    </>
                  )}
                />
              </Box>
            )}

            {isActiveMenuHistory && <ChangesHistory tableId={tableMeta.id} />}
          </Box>
        </>
      )}
    </Box>
  );
};
