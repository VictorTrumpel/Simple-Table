import { useState, type FormEvent } from 'react';
import { DBTreeItem } from '@entity';
import { TreeItem } from '@shared';
import type { GetTreeChartDTO } from '@shared/network';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useViewModel } from './hooks/useViewModel.js';
import { SuccessAddGraph } from './events/SuccessAddGraph.js';

type GraphTreeItemProps = {
  dbId: string;
  charts: GetTreeChartDTO[];
  role: 'admin' | 'writer' | 'reader';
};

export const GraphTreeItem = ({ dbId, charts, role }: GraphTreeItemProps) => {
  const { addGraph } = useViewModel();
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [graphName, setGraphName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCloseDialog = () => {
    if (isCreating) return;

    setOpenDialog(false);
    setGraphName('');
  };

  const handleCreateGraph = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = graphName.trim();
    if (!name || isCreating || role !== 'admin') return;

    setIsCreating(true);
    const response = await addGraph(dbId, name);
    setIsCreating(false);

    if (response.error) {
      enqueueSnackbar('Не удалось создать график!', { variant: 'error' });
      return;
    }

    enqueueSnackbar('График успешно создан!', { variant: 'success' });
    window.dispatchEvent(new Event(SuccessAddGraph));
    setOpenDialog(false);
    setGraphName('');
  };

  return (
    <>
      <DBTreeItem
        itemId={`/graph-list/${dbId}`}
        iconKey="graph"
        label="Графики"
        showOptions={role === 'admin'}
        onAddEntity={() => setOpenDialog(true)}
      >
        {charts.map((chart) => (
          <TreeItem
            key={chart.id}
            itemId={`/chart-item/${chart.id}`}
            label={chart.name}
          />
        ))}
      </DBTreeItem>

      <Dialog fullWidth maxWidth="xs" open={openDialog} onClose={handleCloseDialog}>
        <form onSubmit={handleCreateGraph}>
          <DialogTitle>Новый график</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Имя графика"
              value={graphName}
              onChange={(event) => setGraphName(event.target.value)}
              disabled={isCreating}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isCreating}>
              Закрыть
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={isCreating}
              disabled={!graphName.trim()}
            >
              Создать
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
