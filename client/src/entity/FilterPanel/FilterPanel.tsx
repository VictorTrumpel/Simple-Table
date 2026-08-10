import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";
import type { GetTableDataDTO } from "@shared/network";

type FilterPanelProps = {
  currentColumn: string;
  filterText: string;
  columns: GetTableDataDTO["table"]["columns"];
  onChangeColumn: (col: string) => void;
  onChangeFilterText: (filterText: string) => void;
};

export const FilterPanel = ({
  currentColumn,
  filterText,
  columns,
  onChangeColumn,
  onChangeFilterText,
}: FilterPanelProps) => {
  return (
    <Box
      width="410px"
      padding={1}
      borderRadius="8px"
      gap={1}
      display="flex"
      alignItems="center"
    >
      <FormControl sx={{ width: "200px" }} size="small">
        <InputLabel id="demo-simple-select-label">Колонка</InputLabel>

        <Select
          value={currentColumn}
          label="Колонка"
          onChange={(e) => onChangeColumn(e.target.value)}
        >
          {columns.map((col) => (
            <MenuItem key={col.id} value={col.name}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label="Фильтр"
        size="small"
        value={filterText}
        onChange={(e) => onChangeFilterText(e.target.value)}
      />
    </Box>
  );
};
