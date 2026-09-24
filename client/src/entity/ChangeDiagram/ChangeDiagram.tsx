import type {
  GetChangeItemDTO,
  ChangeRowItemDTO,
  ChangeColumnItem,
} from '@shared/network';
import { Box, Typography, useTheme, styled } from '@mui/material';

const BeforeRows = ({
  beforeRows,
  color,
}: {
  beforeRows: (ChangeRowItemDTO & { cellColor?: string })[];
  color?: string;
}) => {
  return (
    <table border={1}>
      <thead>
        <tr>
          {beforeRows.map(({ columnName, cellColor }, idx) => (
            <th key={idx} style={{ background: cellColor ?? color }}>
              {columnName}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr>
          {beforeRows.map(({ value, cellColor }, idx) => (
            <td key={idx} style={{ background: cellColor ?? color }}>
              {value}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
};

const CompareColumns = ({
  beforeColumn,
  afterColumn,
}: {
  beforeColumn: ChangeColumnItem;
  afterColumn: ChangeColumnItem;
}) => {
  return (
    <Box display="flex" gap={8} alignItems="center">
      <Box width="100">
        <Box>
          {beforeColumn.name}, {beforeColumn.type}
        </Box>
      </Box>

      <span>➜</span>

      <Box width="100">
        <Box>
          {afterColumn.name}, {afterColumn.type}
        </Box>
      </Box>
    </Box>
  );
};

const RotatedRow = styled('span')({
  transform: 'rotate(90deg)',
});

export const ChangeDiagram = ({ item }: { item: GetChangeItemDTO }) => {
  const { palette, alpha } = useTheme();

  if (item.beforeRow instanceof Array && item.afterRow instanceof Array) {
    const { beforeRow, afterRow } = item;

    const beforeRowWithColor = beforeRow.map((beforeCol, idx) => {
      const afterCol = afterRow[idx];

      if (beforeCol.value === afterCol.value) return beforeCol;
      return { ...beforeCol, cellColor: alpha(palette.error.light, 0.2) };
    });

    const afterRowWithColor = afterRow.map((afterCol, idx) => {
      const beforeCol = beforeRow[idx];

      if (beforeCol.value === afterCol.value) return afterCol;
      return { ...afterCol, cellColor: alpha(palette.success.light, 0.2) };
    });

    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <BeforeRows beforeRows={beforeRowWithColor || []} />

        <RotatedRow>➜</RotatedRow>

        <BeforeRows beforeRows={afterRowWithColor || []} />
      </Box>
    );
  }

  if (item.beforeRow instanceof Array) {
    return (
      <BeforeRows
        beforeRows={item.beforeRow || []}
        color={alpha(palette.error.light, 0.2)}
      />
    );
  }

  if (item.afterRow instanceof Array) {
    return (
      <BeforeRows
        beforeRows={item.afterRow || []}
        color={alpha(palette.success.light, 0.2)}
      />
    );
  }

  if (item.beforeColumn && item.afterColumn) {
    return (
      <CompareColumns
        beforeColumn={item.beforeColumn}
        afterColumn={item.afterColumn}
      />
    );
  }

  if (item.beforeColumn) {
    return (
      <Typography color={palette.error.dark}>
        {item.beforeColumn.name}, {item.beforeColumn.type}
      </Typography>
    );
  }

  if (item.afterColumn) {
    return (
      <Typography color={palette.success.light}>
        {item.afterColumn.name}, {item.afterColumn.type}
      </Typography>
    );
  }

  return <></>;
};
