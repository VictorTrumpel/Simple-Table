import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessAddRowEvent } from './events/SuccessAddRowEvent.js';
import type { GetColumnDTO } from '@shared/network';

type AddRowActionProps = {
  tableId: string;
  columns: GetColumnDTO[];
};

export const AddRowAction = ({ tableId, columns }: AddRowActionProps) => {
  const { addRow } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const getInitialValues = () => {
    const values: Record<string, unknown> = {};

    columns.forEach((col) => {
      values[col.id] = '';
    });

    return values;
  };

  const [isAddProccessing, setIsAddProccessing] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [values, setValues] =
    useState<Record<string, unknown>>(getInitialValues());

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleUpdateValue = (colId: string, newValue: string) => {
    setValues({ ...values, [colId]: newValue });
  };

  const handleSubmitForm = async () => {
    setIsAddProccessing(true);

    const response = await addRow(tableId, values);

    setIsAddProccessing(false);

    if (response.error) {
      enqueueSnackbar('Не удалось добавить строку!', { variant: 'error' });
      return;
    }

    window.dispatchEvent(new Event(SuccessAddRowEvent));

    enqueueSnackbar('Строка успешно добавлена!', { variant: 'success' });

    setOpenDialog(false);
  };

  return (
    <>
      <Button onClick={handleOpenDialog}>Добавить строку</Button>

      <Dialog fullWidth open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Добавление строки</DialogTitle>

        <DialogContent>
          <Box
            gap={4}
            component="form"
            display="flex"
            flexDirection="column"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitForm();
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              maxHeight="400px"
              overflow="auto"
              pt={1}
              gap={2}
            >
              {columns.map((col) => {
                const colId = col.id;

                const value = values[colId];

                return (
                  <TextField
                    value={value}
                    size="small"
                    key={col.id}
                    label={col.name}
                    onChange={(e) => handleUpdateValue(colId, e.target.value)}
                  />
                );
              })}
            </Box>

            <Box display="flex" gap={2} justifyContent="end">
              <Button
                onClick={() => setOpenDialog(false)}
                loading={isAddProccessing}
              >
                Закрыть
              </Button>

              <Button
                variant="contained"
                loading={isAddProccessing}
                onClick={handleSubmitForm}
              >
                Добавить
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
