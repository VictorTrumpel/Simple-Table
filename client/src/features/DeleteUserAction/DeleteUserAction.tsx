import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBoolean } from 'react-use';
import { useViewModel } from './hooks/useViewModel.js';
import { useSnackbar } from 'notistack';
import { SuccessDeleteUser } from './events/SuccessDeleteUser.js';

export const DeleteUserAction = ({
  deletedUserName,
  dbId,
  userId,
}: {
  dbId: string;
  userId: string;
  deletedUserName: string;
}) => {
  const { deleteUser } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useBoolean(false);
  const [showDialog, setShowDialog] = useBoolean(false);

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    const response = await deleteUser(dbId, userId);
    setIsDeleting(false);

    if (response.error) {
      enqueueSnackbar('Не удалось удалить пользователя!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Пользователь успешно удален!', { variant: 'success' });

    window.dispatchEvent(new Event(SuccessDeleteUser));

    handleCloseDialog();
  };

  return (
    <>
      <IconButton onClick={handleOpenDialog}>
        <DeleteIcon color="error" />
      </IconButton>

      <Dialog open={showDialog}>
        <DialogTitle>Удаление пользователя из БД</DialogTitle>

        <DialogContent>
          Вы уверены, что хотите удалить пользователя <b>{deletedUserName}</b>{' '}
          из базы данных?
        </DialogContent>

        <DialogActions>
          <Button loading={isDeleting} onClick={handleCloseDialog}>
            Закрыть
          </Button>

          <Button
            loading={isDeleting}
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
