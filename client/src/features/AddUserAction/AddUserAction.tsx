import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Autocomplete,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useBoolean } from 'react-use';
import { useViewModel } from './hooks/useViewModel.js';
import { useSnackbar } from 'notistack';
import type { GetRoleDTO, GetUserDTO } from '@shared/network';
import { SuccessAddUserToDBEvent } from './events/SuccessAddUserToDBEvent.js';

type UserItem = GetUserDTO['userInfo'] & { id: string };

export const AddUserAction = ({ dbId }: { dbId: string }) => {
  const { fetchAllUserList, addUserInDb } = useViewModel();

  const { enqueueSnackbar } = useSnackbar();

  const [userList, setUserList] = useState<UserItem[]>([]);
  const [showDialog, setShowDialog] = useBoolean(false);

  const [values, setValues] = useState<{
    user: UserItem | null;
    role: GetRoleDTO | null;
  }>({
    user: null,
    role: null,
  });

  const handleSelectUser = (newUser: UserItem | null) => {
    setValues({ ...values, user: newUser });
  };

  const handleSelectRole = (role: GetRoleDTO) => {
    setValues({ ...values, role });
  };

  const handleSubmit = async () => {
    const user = values.user;
    if (!user || !values.role) return;

    const response = await addUserInDb(dbId, { id: user.id }, values.role);

    if (response.error) {
      enqueueSnackbar('Не удалось добавить пользователя в базу данных!', {
        variant: 'error',
      });
      return;
    }

    enqueueSnackbar('Пользователь добавлен в базу данных!', {
      variant: 'success',
    });

    setShowDialog(false);

    setValues({ user: null, role: null });

    window.dispatchEvent(new Event(SuccessAddUserToDBEvent));
  };

  const handleOpenDialog = async () => {
    setShowDialog(true);
    const response = await fetchAllUserList();

    if (response.error) return;

    setUserList(response.data);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setValues({ user: null, role: null });
  };

  const isValid = () => {
    return values.user && values.role;
  };

  return (
    <>
      <Button
        variant="outlined"
        sx={{ borderRadius: '8px' }}
        onClick={handleOpenDialog}
      >
        Добавить пользователя
      </Button>

      <Dialog fullWidth open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>Добавление пользователя</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="column"
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            p={1}
            gap={2}
          >
            <Autocomplete
              size="small"
              value={values.user}
              onChange={(_, newValue) => {
                handleSelectUser(newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Пользователь" />
              )}
              getOptionKey={(option) => option.id}
              getOptionLabel={(option) => option.email}
              options={userList}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Роль</InputLabel>
              <Select
                value={values.role || ''}
                onChange={(e) => handleSelectRole(e.target.value as GetRoleDTO)}
                label="Роль"
              >
                <MenuItem value="admin">Конструктор</MenuItem>
                <MenuItem value="writer">Редактор</MenuItem>
                <MenuItem value="reader">Читатель</MenuItem>
              </Select>
            </FormControl>

            <Box display="flex" justifyContent="end" gap={2}>
              <Button onClick={handleCloseDialog}>Закрыть</Button>

              <Button disabled={!isValid()} type="submit" variant="contained">
                Добавить
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
