import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessChangeUserRole } from './events/SuccessChangeUserRole.js';
import { useSnackbar } from 'notistack';

export const ChangeUserRole = ({
  role,
  dbId,
  userId,
}: {
  role: string;
  dbId: string;
  userId: string;
}) => {
  const { setDbRole } = useViewModel();

  const { enqueueSnackbar } = useSnackbar();

  const handleSelectRole = async (role: string) => {
    const response = await setDbRole(dbId, userId, role);

    if (response.error) {
      enqueueSnackbar('Не удалось изменить роль!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Роль успешно изменена!', { variant: 'success' });

    window.dispatchEvent(new Event(SuccessChangeUserRole));
  };

  return (
    <FormControl size="small" sx={{ width: '200px' }}>
      <InputLabel>Роль</InputLabel>
      <Select
        value={role}
        onChange={(e) => handleSelectRole(e.target.value)}
        label="Роль"
      >
        <MenuItem value="admin">Конструктор</MenuItem>
        <MenuItem value="writer">Редактор</MenuItem>
        <MenuItem value="reader">Читатель</MenuItem>
      </Select>
    </FormControl>
  );
};
