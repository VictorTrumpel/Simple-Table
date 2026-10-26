import { Box, Divider, IconButton } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { UserLogo } from '@entity';
import { AddDBAction, DatabaseTreeView } from '@features';
import { useViewModel } from './hooks/useViewModel.js';
import LogoutIcon from '@mui/icons-material/Logout';
import { mainVioletColor } from '@shared';

export const LeftSidebar = (props: BoxProps) => {
  const { userName, avatarUrl, handleLogOut } = useViewModel();

  return (
    <Box
      width="100%"
      height="100%"
      padding={2}
      display="flex"
      flexDirection="column"
      sx={{
        backgroundColor: 'rgb(244 244 245 / 1)',
        borderRight: '1px solid rgb(231 228 230 / 1)',
      }}
      {...props}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <UserLogo name={userName} src={avatarUrl} />

        <IconButton size="small" onClick={handleLogOut}>
          <LogoutIcon fontSize="inherit" sx={{ color: mainVioletColor }} />
        </IconButton>
      </Box>

      <Divider sx={{ mt: 2, mb: 2 }} />

      <AddDBAction />

      <DatabaseTreeView />
    </Box>
  );
};
