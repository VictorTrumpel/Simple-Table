import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import {
  chartService,
  databaseService,
  type GetColumnDTO,
} from '@shared/network';
import type { GetTableMetaDTO } from '../../shared/network/dto/table/GetTableMetaDTO.js';

type Props = {
  chartId: string;
  dbId: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export const AddChartBindingDialog = ({
  chartId,
  dbId,
  onClose,
  onSuccess,
}: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const [tables, setTables] = useState<GetTableMetaDTO[]>([]);
  const [table, setTable] = useState<GetTableMetaDTO | null>(null);
  const [column, setColumn] = useState<GetColumnDTO | null>(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const submitting = useRef(false);
  const canSubmit = Boolean(
    table && column && name.trim() && name.length <= 255,
  );
  const activeStep = !table ? 0 : !column ? 1 : 2;

  useEffect(() => {
    let isActive = true;

    const loadTables = async () => {
      const response = await databaseService.getTables(dbId);
      if (!isActive) return;

      if (response.error) {
        setLoadError(true);
      } else {
        setTables(response.data);
      }
      setIsLoading(false);
    };

    void loadTables();
    return () => {
      isActive = false;
    };
  }, [dbId]);

  const handleClose = () => {
    if (!submitting.current) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !table || !column || submitting.current) return;

    submitting.current = true;
    setIsSaving(true);
    setSaveError(null);
    const response = await chartService.addBinding(chartId, {
      tableId: table.id,
      columnId: column.id,
      bindingKey: name.trim(),
    });
    submitting.current = false;
    setIsSaving(false);

    if (response.error) {
      setSaveError(
        'Не удалось добавить ссылку на колонку. Попробуйте ещё раз.',
      );
      return;
    }

    enqueueSnackbar('Ссылка на колонку добавлена', { variant: 'success' });
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      aria-labelledby="add-chart-binding-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="add-chart-binding-title">
          Добавить ссылку на колонку
        </DialogTitle>
        <DialogContent>
          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Не удалось загрузить таблицы. Закройте окно и попробуйте ещё раз.
            </Alert>
          )}
          {saveError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {saveError}
            </Alert>
          )}
          <Stepper orientation="vertical" activeStep={activeStep}>
            <Step expanded completed={Boolean(table)}>
              <StepLabel>Таблица</StepLabel>
              <StepContent>
                <Autocomplete
                  sx={{
                    '& .MuiAutocomplete-clearIndicator': {
                      visibility: 'visible',
                    },
                  }}
                  size="small"
                  options={tables}
                  value={table}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, value) => {
                    setTable(value);
                    setColumn(null);
                    setName('');
                    setSaveError(null);
                  }}
                  disabled={isLoading || loadError || isSaving}
                  loading={isLoading}
                  loadingText="Загрузка таблиц…"
                  noOptionsText="Таблицы не найдены"
                  clearText="Очистить таблицу"
                  openText="Показать таблицы"
                  closeText="Скрыть таблицы"
                  renderInput={(params) => (
                    <TextField {...params} label="Таблица" />
                  )}
                />
              </StepContent>
            </Step>
            <Step expanded disabled={!table} completed={Boolean(column)}>
              <StepLabel>Колонка</StepLabel>
              <StepContent>
                <Autocomplete
                  sx={{
                    '& .MuiAutocomplete-clearIndicator': {
                      visibility: 'visible',
                    },
                  }}
                  size="small"
                  options={table?.columns ?? []}
                  value={column}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, value) => {
                    setColumn(value);
                    setName(value?.name ?? '');
                    setSaveError(null);
                  }}
                  disabled={!table || isSaving}
                  noOptionsText="Колонки не найдены"
                  clearText="Очистить колонку"
                  openText="Показать колонки"
                  closeText="Скрыть колонки"
                  renderInput={(params) => (
                    <TextField {...params} label="Колонка" />
                  )}
                />
              </StepContent>
            </Step>
            <Step expanded disabled={!column} completed={canSubmit}>
              <StepLabel>Имя</StepLabel>
              <StepContent>
                <TextField
                  fullWidth
                  label="Имя"
                  value={name}
                  size="small"
                  disabled={!column || isSaving}
                  onChange={(event) => {
                    setName(event.target.value);
                    setSaveError(null);
                  }}
                  error={name.length > 255}
                  helperText={
                    name.length > 255 ? 'Не более 255 символов' : undefined
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="Очистить имя"
                            edge="end"
                            disabled={!column || !name || isSaving}
                            onClick={() => {
                              setName('');
                              setSaveError(null);
                            }}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit || isSaving}
          >
            {isSaving ? 'Добавление…' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
