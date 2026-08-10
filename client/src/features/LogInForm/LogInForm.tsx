import { useState, type ChangeEvent } from 'react';
import { Box, TextField, Typography, Button } from '@mui/material';
import { useViewModel } from './hooks/useViewModel.js';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom';

export const LogInForm = () => {
  const { authUserByData, setUserInfo } = useViewModel();

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  });

  const handleUpdateLogin = (e: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, email: e.target.value });
  };

  const handleUpdatePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, password: e.target.value });
  };

  const handleSubmitForm = async () => {
    setIsLoading(true);
    const response = await authUserByData(values);
    setIsLoading(false);

    if (response.error) {
      enqueueSnackbar('Не удалось войти в систему!', { variant: 'error' });
      return;
    }

    setUserInfo(response.data);
  };

  const handleGoToCreateAccaunt = () => {
    history.push('/registration');
  };

  const isValid = () => {
    return values.email && values.password;
  };

  return (
    <Box
      component="form"
      display="flex"
      flexDirection="column"
      gap={2}
      width="400px"
      border="1px solid rgb(231 228 230)"
      padding="16px"
      borderRadius="8px"
      bgcolor="white"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmitForm();
      }}
    >
      <Typography
        variant="h5"
        textAlign="center"
        alignItems="center"
        justifyContent="center"
        fontWeight="bold"
      >
        Simple Table
      </Typography>

      <TextField
        value={values.email}
        onChange={handleUpdateLogin}
        size="small"
        fullWidth
        label="Логин"
      />

      <TextField
        value={values.password}
        onChange={handleUpdatePassword}
        size="small"
        fullWidth
        label="Пароль"
        type="password"
      />

      <Box
        width="100%"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        gap={1}
      >
        <Button
          disabled={!isValid()}
          fullWidth
          loading={isLoading}
          type="submit"
          variant="contained"
        >
          Войти
        </Button>

        <Typography sx={{ display: 'flex' }}>или</Typography>

        <Button
          fullWidth
          loading={isLoading}
          type="submit"
          variant="outlined"
          onClick={handleGoToCreateAccaunt}
        >
          Создать аккаунт
        </Button>
      </Box>
    </Box>
  );
};
