import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
} from '@mui/material';
import { EnumEditor } from '@entity';
import { useViewModel } from './hooks/useViewModel.js';
import EditIcon from '@mui/icons-material/Edit';
import { useBoolean } from 'react-use';
import type { GetColumnDTO, Response } from '@shared/network';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { SuccessEditColumn } from './event/SuccessEditColumn.js';
import AddIcon from '@mui/icons-material/Add';

type EditColumnActionProps = Partial<GetColumnDTO> & {
  tableId: string;
  view: 'EDIT' | 'CREATE';
};

export const EditColumnAction = ({
  id: colId,
  view,
  name,
  type,
  tableId,
  enum: defaultEnums,
}: EditColumnActionProps) => {
  const { editColumn, handleSave } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();

  const [showDialog, setShowDialog] = useBoolean(false);
  const [isUpdating, setIsUpdating] = useBoolean(false);

  const [enums, setEnums] = useState<string[]>(defaultEnums || []);

  const [values, setValues] = useState<{ name: string; type: string }>({
    name: name || '',
    type: type || '',
  });

  const handleCloseDialog = () => {
    setValues({ name: '', type: '' });
    setEnums(defaultEnums || []);
    setShowDialog(false);
  };

  const handleEditColName = (colName: string) => {
    setValues({ ...values, name: colName });
  };

  const handleUpdateColType = (colType: string) => {
    setValues({ ...values, type: colType });
  };

  const handleOpenDialog = () => {
    setValues({ name: name || '', type: type || '' });
    setEnums(defaultEnums || []);
    setShowDialog();
  };

  const handleSaveColumn = async () => {
    setIsUpdating(true);

    let response: Response<unknown>;

    if (colId) {
      response = await editColumn(tableId, {
        id: colId,
        name: values.name,
        type: values.type,
        enum: enums,
      });
    } else {
      response = await handleSave(tableId, {
        name: values.name,
        type: values.type,
        enum: enums,
      });
    }

    setIsUpdating(false);

    if (response.error) {
      enqueueSnackbar('Не удалось обновить колонку!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Колонка успешно обновлена!', { variant: 'success' });

    window.dispatchEvent(new Event(SuccessEditColumn));

    handleCloseDialog();
  };

  const isValid = () => {
    if (values.type === 'enum') {
      return values.name.trim() && enums.every(Boolean) && enums.length > 0;
    }

    return values.name.trim() && values.type.trim();
  };

  return (
    <>
      {view === 'EDIT' && (
        <IconButton onClick={handleOpenDialog}>
          <EditIcon />
        </IconButton>
      )}

      {view === 'CREATE' && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          sx={{ borderRadius: '8px' }}
          onClick={handleOpenDialog}
        >
          Добавить колонку
        </Button>
      )}

      <Dialog fullWidth open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Изменение колонки</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            pt={1}
            gap={2}
            display="flex"
            flexDirection="column"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveColumn();
            }}
          >
            <TextField
              label="Имя колонки"
              size="small"
              value={values.name}
              onChange={(e) => handleEditColName(e.target.value)}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Тип колонки</InputLabel>
              <Select
                value={values.type}
                onChange={(e) => handleUpdateColType(e.target.value)}
                label="Тип колонки"
              >
                <MenuItem value="text">Текст</MenuItem>
                <MenuItem value="numeric">Число</MenuItem>
                <MenuItem value="timestamp">Дата и время</MenuItem>
                <MenuItem value="enum">Выбор из предложенных</MenuItem>
              </Select>
            </FormControl>

            {values.type === 'enum' && (
              <EnumEditor enums={enums} onChange={setEnums} />
            )}

            <Box display="flex" gap={1} justifyContent="end">
              <Button loading={isUpdating} onClick={handleCloseDialog}>
                Закрыть
              </Button>

              <Button
                loading={isUpdating}
                disabled={!isValid()}
                type="submit"
                variant="contained"
                onClick={handleSaveColumn}
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
