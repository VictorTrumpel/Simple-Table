import { useRef, useState, type ChangeEvent } from 'react';
import type { GetTreeTableDTO } from '@shared/network';
import {
  DBTreeItem,
  CreateTableButton,
  type CrateTableButtonProps,
} from '@entity';
import { VisuallyHiddenInput } from '@shared';
import { TableTreeItem } from '../TableTreeItem/TableTreeItem.js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box,
  Button,
} from '@mui/material';
import { RiFileExcel2Fill } from 'react-icons/ri';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessAddTable } from './events/SuccessAddTable.js';
import type { Response } from '@shared/network';

type TableTreeItemsProps = {
  dbId: string;
  tables: GetTreeTableDTO[];
  role: 'admin' | 'writer' | 'reader';
};

type CreationMethod = CrateTableButtonProps['view'];

export const TableTreeItems = ({ dbId, tables, role }: TableTreeItemsProps) => {
  const { addTable, addTableViaFile } = useViewModel();

  const [openDialog, setOpenDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [tableName, setTableName] = useState('');
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const resetFilesInput = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.files = null;
      fileInputRef.current.value = '';
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTableName('');
    setCreationMethod(null);

    resetFilesInput();
  };

  const handleSelectCreationMethod = (method: CreationMethod) => {
    setCreationMethod(method);

    resetFilesInput();
  };

  const handleUpdateTableName = (e: ChangeEvent<HTMLInputElement>) => {
    setTableName(e.target.value);
  };

  const handleCreateTable = async () => {
    setIsCreating(true);

    let response: Response<unknown>;

    if (file) {
      response = await addTableViaFile(dbId, tableName, file);
    } else {
      response = await addTable(dbId, tableName);
    }

    if (response.error) {
      setIsCreating(false);
      return;
    }

    setIsCreating(false);

    window.dispatchEvent(new Event(SuccessAddTable));

    handleCloseDialog();
  };

  const handleSelectFile = (fileList: FileList | null) => {
    if (!fileList) return;
    const file = fileList[0];
    setFile(file);
    setCreationMethod(null);
  };

  const isValid = () => {
    if (!tableName) return false;
    if (!creationMethod && !file) return false;
    return true;
  };

  return (
    <>
      <DBTreeItem
        itemId={`/table-list/${dbId}`}
        iconKey="table"
        label="Таблицы"
        showOptions={role === 'admin'}
        onAddEntity={handleOpenDialog}
      >
        {tables.map((table) => (
          <TableTreeItem
            key={table.id}
            tableId={table.id}
            tableName={table.name}
            enableDelete={role === 'admin'}
          />
        ))}
      </DBTreeItem>

      <Dialog onClose={handleCloseDialog} open={openDialog}>
        <DialogTitle>Новая таблица</DialogTitle>

        <DialogContent>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isValid()) return;
              handleCreateTable();
            }}
          >
            <TextField
              onChange={handleUpdateTableName}
              fullWidth
              sx={{ mt: 1 }}
              label="Имя таблицы"
            />

            <Box mt={2} gap={2} display="flex" justifyContent="center">
              <Button
                component="label"
                variant={file ? 'contained' : 'outlined'}
                sx={{
                  width: '200px',
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  paddingTop: '16px',
                  border: '1px solid rgb(169 162 168 / 1)',
                }}
              >
                <RiFileExcel2Fill transform="scale(2)" />
                Excel/CSV
                <VisuallyHiddenInput
                  accept=".xls, .csv, .xlsx"
                  ref={fileInputRef}
                  onChange={(event) => handleSelectFile(event.target.files)}
                  type="file"
                />
              </Button>

              <CreateTableButton
                view="blank-table"
                selected={creationMethod === 'blank-table'}
                onClick={() => handleSelectCreationMethod('blank-table')}
              />
            </Box>

            <Box mt={4} display="flex" justifyContent="end">
              <Button onClick={handleCloseDialog}>Закрыть</Button>

              <Button
                loading={isCreating}
                type="submit"
                variant="contained"
                form="subscription-form"
                disabled={!isValid()}
                onClick={handleCreateTable}
              >
                Создать
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
