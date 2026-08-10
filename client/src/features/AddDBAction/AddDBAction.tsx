import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';
import { SuccessAddDb } from './events/SuccessAddDB.js';
import { useViewModel } from './hooks/useViewModel.js';
import AddIcon from '@mui/icons-material/Add';

export const AddDBAction = () => {
  const { createDatabase } = useViewModel();

  const [open, setOpen] = useState(false);
  const [dbName, setDbName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setDbName('');
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setDbName(e.target.value);
  };

  const handleSubmit = async () => {
    setIsCreating(true);

    const response = await createDatabase(dbName);

    if (response.error) {
      setIsCreating(false);
      return;
    }

    setIsCreating(false);

    window.dispatchEvent(new Event(SuccessAddDb));

    handleClose();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box display="flex" justifyContent="center">
      <Button
        sx={{ mb: 1, width: '100%' }}
        startIcon={<AddIcon />}
        size="small"
        variant="text"
        onClick={handleOpen}
      >
        Добавить базу данных
      </Button>

      <Dialog fullWidth open={open} onClose={handleClose} title="Создание БД">
        <DialogTitle>Новая база данных</DialogTitle>

        <DialogContent>
          <TextField
            sx={{ mt: 2 }}
            value={dbName}
            onChange={handleChangeName}
            autoFocus
            fullWidth
            onKeyDown={handleKeyDown}
            label="Имя базы данных"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>

          <Button
            loading={isCreating}
            type="submit"
            variant="contained"
            form="subscription-form"
            onClick={handleSubmit}
          >
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
