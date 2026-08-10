import { Box } from '@mui/material';
import { FaDatabase } from 'react-icons/fa6';
import { MdViewColumn } from 'react-icons/md';
import { MenuTab } from './ui/MenuTab.js';
import type { TableMenuPanel } from '@shared/model';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';

export type MenuTableWorkProps = {
  activeHistoryMenu: boolean;
  activeValue: TableMenuPanel;
  onSelectTab: (value: TableMenuPanel) => void;
  onToggleMenuHistory: () => void;
  onExcelDownload: () => void;
};

export const MenuTableWork = ({
  activeHistoryMenu,
  activeValue,
  onSelectTab,
  onToggleMenuHistory,
  onExcelDownload,
}: MenuTableWorkProps) => {
  return (
    <Box
      height="40px"
      display="flex"
      padding={0.5}
      gap="4px"
      alignContent="center"
      borderRadius="8px"
      sx={{ border: '1px solid rgb(231 228 230 / 1)' }}
    >
      <MenuTab
        active={activeValue === 'records'}
        startIcon={<FaDatabase transform="scale(0.8)" />}
        onClick={() => onSelectTab('records')}
      >
        Записи
      </MenuTab>

      <MenuTab
        active={activeValue === 'columns'}
        startIcon={<MdViewColumn />}
        onClick={() => onSelectTab('columns')}
      >
        Колонки
      </MenuTab>

      <MenuTab
        active={activeHistoryMenu}
        startIcon={<RestorePageIcon />}
        onClick={onToggleMenuHistory}
      >
        История изменений
      </MenuTab>

      <MenuTab
        startIcon={<PiMicrosoftExcelLogoFill />}
        onClick={onExcelDownload}
      >
        Выгрузка в excel
      </MenuTab>
    </Box>
  );
};
