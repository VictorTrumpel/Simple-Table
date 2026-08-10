import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { useViewModel } from './hooks/useViewModel.js';
import { useSnackbar } from 'notistack';
import {
  AddUserAction,
  SuccessAddUserToDBEvent,
  ChangeUserRole,
  SuccessChangeUserRole,
  DeleteUserAction,
  SuccessDeleteUser,
} from '@features';
import { List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import type { GetDbUserInfoDTO } from '@shared/network';
import type { GetRoleDTO } from '@shared/network';

export const PaticipantOfDB = () => {
  const { fetchUsersOfDb, checkRole } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();
  const { palette } = useTheme();
  const location = useLocation();

  const [role, setRole] = useState<GetRoleDTO | null>(null);
  const [dbId, setDbId] = useState<string | null>(null);
  const [userList, setUserList] = useState<GetDbUserInfoDTO[]>([]);

  const handleUpdateUserList = async () => {
    const dbId = location.pathname.split('/').at(-1);

    if (!dbId) return;

    const response = await fetchUsersOfDb(dbId);

    setDbId(dbId);

    if (response.error) {
      enqueueSnackbar('Не удалось загрузить пользователей таблицы!', {
        variant: 'error',
      });
      return;
    }

    setUserList(response.data);

    const roleResponse = await checkRole(String(dbId));

    if (roleResponse.error) {
      enqueueSnackbar('Не удалось установить рлоль!', { variant: 'error' });
      return;
    }

    setRole(roleResponse.data.role);
  };

  useEffect(() => {
    handleUpdateUserList();

    window.addEventListener(SuccessAddUserToDBEvent, handleUpdateUserList);
    window.addEventListener(SuccessChangeUserRole, handleUpdateUserList);
    window.addEventListener(SuccessDeleteUser, handleUpdateUserList);

    return () => {
      window.removeEventListener(SuccessAddUserToDBEvent, handleUpdateUserList);
      window.removeEventListener(SuccessChangeUserRole, handleUpdateUserList);
      window.removeEventListener(SuccessDeleteUser, handleUpdateUserList);
    };
  }, [location]);

  return (
    <Box
      paddingLeft={2}
      paddingRight={2}
      paddingBottom={2}
      maxHeight="100%"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Typography sx={{ marginTop: '3px' }} variant="h6">
        Участники таблицы
      </Typography>

      {dbId && role === 'admin' && (
        <Box display="flex" gap={2}>
          <AddUserAction dbId={dbId} />
        </Box>
      )}

      <List
        sx={{
          width: '100%',
          display: 'flex',
          flex: '1',
          overflow: 'auto',
          height: '100%',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {userList.map((user) => (
          <ListItem key={user.id} sx={{ padding: 0 }}>
            <ListItemButton
              sx={{
                background: palette.grey[200],
                borderRadius: '8px',
                gap: 1,
              }}
            >
              <ListItemText primary={user.name} />

              {dbId && role === 'admin' && (
                <ChangeUserRole
                  dbId={dbId}
                  userId={String(user.id)}
                  role={user.role}
                />
              )}

              {dbId && role === 'admin' && (
                <DeleteUserAction
                  dbId={dbId}
                  userId={String(user.id)}
                  deletedUserName={user.name}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
