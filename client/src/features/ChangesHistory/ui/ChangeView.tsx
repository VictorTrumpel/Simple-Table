import type { GetChangeItemDTO } from "@shared/network";
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { ChangeDiagram } from "@entity";
import { format } from "date-fns";
import { useBoolean } from "react-use";
import LaunchIcon from "@mui/icons-material/Launch";

export const ChangeView = ({ item }: { item: GetChangeItemDTO }) => {
  const { palette } = useTheme();
  const [showDialog, setShowDialog] = useBoolean(false);

  const author = item.user;

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date).getTime(), "yyyy-mm-dd hh:mm:ss");
    } catch {
      return "";
    }
  };

  const getChageMessage = () => {
    const entityMatcher = {
      row: "Строка",
      column: "Колонка",
    };

    const actionMatcher = {
      add: "добавлена",
      update: "обновлена",
      delete: "удалена",
    };

    return `${entityMatcher[item.changedEntity]} ${
      actionMatcher[item.changeType]
    }`;
  };

  return (
    <>
      <Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            color={
              item.changeType === "delete"
                ? palette.error.dark
                : palette.success.dark
            }
          >
            {getChageMessage()}
          </Typography>

          <IconButton size="small" onClick={handleOpenDialog}>
            <LaunchIcon fontSize="inherit" />
          </IconButton>
        </Box>

        <Typography fontSize="13px" color={palette.info.dark}>
          {author.email}
        </Typography>

        <Typography fontSize="11px" color={palette.grey[800]}>
          {formatDate(item.changedAt)}
        </Typography>
      </Box>

      <Dialog open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>Изменения:</DialogTitle>
        <DialogContent>
          <ChangeDiagram item={item} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Понятно</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
