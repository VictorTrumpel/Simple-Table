import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { TableHistory } from './ui/TableHistory.js';
import { CellHistory } from './ui/CellHistory.js';

export const ChangesHistory = ({ tableId }: { tableId: string }) => {
  const [tab, setTab] = useState<number>(0);

  const handleChange = (_: unknown, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box
      width="250px"
      marginLeft={1}
      p={1}
      pt={0}
      borderRadius="8px"
      border="1px solid rgb(231 228 230 / 1)"
      height="100%"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Tabs
        sx={{
          width: '100%',
          '& .MuiTabs-list': {
            justifyContent: 'space-around',
          },
        }}
        value={tab}
        onChange={handleChange}
      >
        <Tab label="Таблица" />
        <Tab label="Ячейка" />
      </Tabs>

      {tab === 0 && <TableHistory tableId={tableId} />}
      {tab === 1 && <CellHistory tableId={tableId} />}
    </Box>
  );
};
