import { useState } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from '@mui/material';
import { useViewModel } from './hooks/useViewModel.js';
import type { GetColumnDTO } from '@shared/network';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import { SuccessDeleteColumn } from './events/SuccessDeleteColumn.js';

type DeleteColumnAction = GetColumnDTO & {
  tableId: string;
};

export const DeleteColumnAction = ({
  tableId,
  id: columnId,
  name,
}: DeleteColumnAction) => {
  const { deleteColumn } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDeleteColumn = async () => {
    setLoading(true);

    const response = await deleteColumn(tableId, columnId);

    setLoading(false);

    if (response.error) {
      enqueueSnackbar('Не удалось удалить колонку! Попробуйте позже.', {
        variant: 'error',
      });
      return;
    }

    enqueueSnackbar('Колонка успешно удалена!', {
      variant: 'success',
    });

    window.dispatchEvent(new Event(SuccessDeleteColumn));

    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <DeleteIcon />
      </IconButton>

      <Dialog fullWidth open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Предупреждение</DialogTitle>

        <DialogContent>
          Вы уверены, что хотите удалить колонку{' '}
          <Typography display="inline-block" fontWeight="bold">
            {name}
          </Typography>{' '}
          ?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
          <Button
            loading={loading}
            variant="contained"
            onClick={handleDeleteColumn}
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
