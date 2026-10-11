import { useState, type MouseEvent } from 'react';
import { TreeItem } from '@shared';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useViewModel } from './hooks/useViewModel.js';
import DeleteIcon from '@mui/icons-material/Delete';
import { SuccessDeleteTable } from './events/SuccessDeleteTable.js';

export const TableTreeItem = ({
  tableId,
  tableName,
  enableDelete = true,
}: {
  tableId: string;
  tableName: string;
  enableDelete?: boolean;
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const { deleteTable } = useViewModel();

  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
  const [openDelteTableDialog, setOpenDelteTableDialog] = useState(false);

  const handleOpenDeleteDialog = (e: MouseEvent) => {
    e.stopPropagation();
    setOpenDelteTableDialog(true);
  };

  const handleDeleteTable = async () => {
    setIsDeleteProcessing(true);

    const response = await deleteTable(tableId);

    setIsDeleteProcessing(false);

    if (response.error) {
      enqueueSnackbar('Не удалось удалить таблицу!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('Таблица успешно удалена!', { variant: 'success' });

    setOpenDelteTableDialog(false);

    window.dispatchEvent(new Event(SuccessDeleteTable));
  };

  return (
    <>
      <TreeItem
        key={`/table-item/${tableId}`}
        itemId={`/table-item/${tableId}`}
        label={
          <>
            {tableName}{' '}
            {enableDelete && (
              <IconButton size="small" onClick={handleOpenDeleteDialog}>
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            )}
          </>
        }
      />

      <Dialog
        open={openDelteTableDialog}
        onClose={() => setOpenDelteTableDialog(false)}
      >
        <DialogTitle>Удаление таблицы</DialogTitle>
        <DialogContent>
          Вы уверены, что хотите удалить таблицу <b>{tableName}</b>?
        </DialogContent>
        <DialogActions>
          <Button
            loading={isDeleteProcessing}
            onClick={() => setOpenDelteTableDialog(false)}
          >
            Закрыть
          </Button>

          <Button
            loading={isDeleteProcessing}
            variant="contained"
            color="error"
            onClick={handleDeleteTable}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
