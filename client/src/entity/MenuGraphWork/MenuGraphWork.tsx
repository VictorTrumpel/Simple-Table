import { Box } from '@mui/material';
import { FaDatabase } from 'react-icons/fa6';
import { MdShowChart } from 'react-icons/md';
import { MenuTab } from '../MenuTableWork/ui/MenuTab.js';

export type GraphMenuPanel = 'chart' | 'data';

export type MenuGraphWorkProps = {
  activeValue: GraphMenuPanel;
  onSelectTab: (value: GraphMenuPanel) => void;
};

export const MenuGraphWork = ({
  activeValue,
  onSelectTab,
}: MenuGraphWorkProps) => {
  return (
    <Box
      role="tablist"
      aria-label="Разделы графика"
      height="40px"
      display="flex"
      padding={0.5}
      gap="4px"
      alignContent="center"
      borderRadius="8px"
      sx={{ border: '1px solid rgb(231 228 230 / 1)' }}
    >
      <MenuTab
        role="tab"
        id="graph-tab-chart"
        aria-controls="graph-panel-chart"
        aria-selected={activeValue === 'chart'}
        active={activeValue === 'chart'}
        startIcon={<MdShowChart />}
        onClick={() => onSelectTab('chart')}
      >
        График
      </MenuTab>

      <MenuTab
        role="tab"
        id="graph-tab-data"
        aria-controls="graph-panel-data"
        aria-selected={activeValue === 'data'}
        active={activeValue === 'data'}
        startIcon={<FaDatabase transform="scale(0.8)" />}
        onClick={() => onSelectTab('data')}
      >
        Данные
      </MenuTab>
    </Box>
  );
};
