import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import {
  LeftSidebar,
  TableWorkArea,
  AuthPage,
  PaticipantOfDB,
  RegistrationPage,
} from '@widgets';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@shared/theme';
import { SnackbarProvider } from 'notistack';
import { useViewModel } from './hooks/useViewModel.js';
import { useMount } from 'react-use';

export const App = () => {
  const [isAuthProcess, setIsAuthProcess] = useState(true);

  const { user, authUser } = useViewModel();

  const handleMount = async () => {
    setIsAuthProcess(true);
    await authUser();
    setIsAuthProcess(false);
  };

  useMount(() => {
    handleMount();
  });

  if (isAuthProcess) return <LoadingPage />;

  return (
    <Router>
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {user ? (
            <AppContent />
          ) : (
            <Switch>
              <Route path="/registration">
                <RegistrationPage />
              </Route>
              <Route path="/">
                <AuthPage />
              </Route>
            </Switch>
          )}
        </ThemeProvider>
      </SnackbarProvider>
    </Router>
  );
};

const AppContent = () => {
  return (
    <Box width="100%" height="100%" display="flex">
      <LeftSidebar minWidth="250px" maxWidth="300px" />

      <Box
        flex={1}
        overflow="hidden"
        width="100%"
        height="100%"
        sx={{ backgroundColor: 'rgb(250 250 250 / 1)' }}
      >
        <Switch>
          <Route path="/table-item">
            <TableWorkArea />
          </Route>
          <Route path="/paticipant-list">
            <PaticipantOfDB />
          </Route>
        </Switch>
      </Box>
    </Box>
  );
};

const LoadingPage = () => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="rgb(211, 160, 203, 0.4)"
    >
      <CircularProgress color="secondary" />
    </Box>
  );
};
