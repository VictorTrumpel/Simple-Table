import {
  Box,
  MenuItem,
  Typography,
  type BoxProps,
  IconButton,
} from "@mui/material";
import Select from "@mui/material/Select";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

type TablePaginatorProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  onChangePaginationMeta: (paginationMeta: {
    page: number;
    pageSize: number;
  }) => void;
  sx?: BoxProps["sx"];
};

export const TablePaginator = ({
  page,
  pageSize,
  totalItems,
  onChangePaginationMeta,
  sx,
}: TablePaginatorProps) => {
  const handlePageNext = () => {
    if (page * pageSize < totalItems) {
      onChangePaginationMeta({ pageSize, page: page + 1 });
    }
  };

  const handlePagePrev = () => {
    if (page > 1) {
      onChangePaginationMeta({ pageSize, page: page - 1 });
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} sx={sx}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography fontSize="13px">Размер страницы:</Typography>

        <Select
          size="small"
          value={pageSize}
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={(e) =>
            onChangePaginationMeta({ page, pageSize: e.target.value })
          }
        >
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </Select>
      </Box>

      <Typography fontSize="13px">
        {pageSize * page - pageSize + 1} - {pageSize * page} из {totalItems}
      </Typography>

      <Box>
        <IconButton size="small" onClick={handlePagePrev}>
          <ArrowBackIosNewIcon fontSize="inherit" />
        </IconButton>

        <IconButton size="small" onClick={handlePageNext}>
          <ArrowBackIosNewIcon
            sx={{ transform: "rotate(180deg)" }}
            fontSize="inherit"
          />
        </IconButton>
      </Box>
    </Box>
  );
};
