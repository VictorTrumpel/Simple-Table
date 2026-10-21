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
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import type { GetChartBindingDTO } from '@shared/network';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessDeleteBinding } from './events/SuccessDeleteBinding.js';

type Props = Pick<GetChartBindingDTO, 'id' | 'bindingKey'> & {
  chartId: string;
};

export const DeleteBindingAction = ({ chartId, id, bindingKey }: Props) => {
  const { deleteBinding } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    if (!loading) setOpen(false);
  };

  const handleDeleteBinding = async () => {
    if (loading) return;

    setLoading(true);
    const response = await deleteBinding(chartId, id);
    setLoading(false);

    if (response.error) {
      enqueueSnackbar(
        'Не удалось удалить ссылку на колонку! Попробуйте позже.',
        {
          variant: 'error',
        },
      );
      return;
    }

    enqueueSnackbar('Ссылка на колонку успешно удалена!', {
      variant: 'success',
    });
    setOpen(false);
    window.dispatchEvent(new Event(SuccessDeleteBinding));
  };

  return (
    <>
      <IconButton
        aria-label={`Удалить ссылку ${bindingKey}`}
        onClick={() => setOpen(true)}
      >
        <DeleteIcon />
      </IconButton>

      <Dialog fullWidth open={open} onClose={handleClose}>
        <DialogTitle>Предупреждение</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить ссылку на колонку{' '}
          <Typography component="span" fontWeight="bold">
            {bindingKey}
          </Typography>
          ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Закрыть
          </Button>
          <Button
            loading={loading}
            variant="contained"
            onClick={handleDeleteBinding}
            color="error"
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
