import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export const EnumEditor = ({
  enums,
  onChange,
}: {
  enums: string[];
  onChange: (enums: string[]) => void;
}) => {
  const { palette } = useTheme();

  const handleEdit = (idx: number, newValue: string) => {
    const copyValues = [...enums];

    copyValues[idx] = newValue;

    onChange(copyValues);
  };

  const handleAddValue = () => {
    onChange([...enums, ""]);
  };

  const handleDeleteRow = (idx: number) => {
    const copy = [...enums];

    copy.splice(idx, 1);

    onChange(copy);
  };

  return (
    <Box
      border={`1px solid ${palette.grey[500]}`}
      maxHeight="500px"
      overflow="auto"
      width="300px"
      gap={1}
      padding={2}
      borderRadius={2}
      display="flex"
      flexDirection="column"
    >
      <Typography>Варианты:</Typography>

      {enums.map((value, idx) => (
        <Box key={idx} display="flex" alignItems="center">
          <TextField
            fullWidth
            size="small"
            key={idx}
            label={`Вариант ${idx + 1}`}
            value={value}
            onChange={(e) => handleEdit(idx, e.target.value)}
          />

          <IconButton color="info" onClick={() => handleDeleteRow(idx)}>
            <HighlightOffIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        sx={{ width: "226px" }}
        startIcon={<AddCircleOutlineIcon />}
        variant="outlined"
        onClick={handleAddValue}
      >
        Добавить
      </Button>
    </Box>
  );
};
