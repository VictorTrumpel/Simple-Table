import { useEffect, useRef } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useSnackbar } from 'notistack';

type YandexAuthProps = {
  onSuccess: (accessToken: string) => Promise<void>;
  disabled?: boolean;
};

const OAUTH_STATE_KEY = 'simple-table:yandex-oauth-state';

const getRedirectUri = () => `${window.location.origin}/`;

export const YandexAuth = ({
  onSuccess,
  disabled = false,
}: YandexAuthProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const clientId = import.meta.env.VITE_YANDEX_CLIENT_ID?.trim();
  const onSuccessRef = useRef(onSuccess);
  const enqueueSnackbarRef = useRef(enqueueSnackbar);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    enqueueSnackbarRef.current = enqueueSnackbar;
  }, [onSuccess, enqueueSnackbar]);

  useEffect(() => {
    if (!clientId) return;

    const processHash = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get('access_token');
      const state = params.get('state');
      const error = params.get('error');

      if (!accessToken && !error) return;

      const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
      sessionStorage.removeItem(OAUTH_STATE_KEY);

      // Do not keep the access token in the address bar or browser history.
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}`,
      );

      if (error) {
        enqueueSnackbarRef.current(
          error === 'access_denied'
            ? 'Вход через Яндекс отменён.'
            : 'Не удалось войти через Яндекс. Попробуйте ещё раз.',
          { variant: 'error' },
        );
        return;
      }

      if (!accessToken || !state || state !== expectedState) {
        enqueueSnackbarRef.current(
          'Не удалось войти через Яндекс. Попробуйте ещё раз.',
          { variant: 'error' },
        );
        return;
      }

      onSuccessRef.current(accessToken).catch(() => {
        enqueueSnackbarRef.current(
          'Не удалось войти через Яндекс. Попробуйте ещё раз.',
          { variant: 'error' },
        );
      });
    };

    processHash();
    window.addEventListener('hashchange', processHash);
    return () => window.removeEventListener('hashchange', processHash);
  }, [clientId]);

  const handleLogin = () => {
    if (!clientId) return;

    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      response_type: 'token',
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      state,
      scope: 'login:info login:email',
    });

    window.location.assign(
      `https://oauth.yandex.ru/authorize?${params.toString()}`,
    );
  };

  return (
    <Tooltip
      title={
        clientId
          ? 'Войти через Яндекс'
          : 'Вход через Яндекс временно недоступен'
      }
    >
      <span>
        <IconButton
          type="button"
          aria-label="Войти через Яндекс"
          disabled={!clientId || disabled}
          onClick={handleLogin}
          sx={{ width: 40, height: 40, border: '1px solid #dadce0' }}
        >
          <Box component="span" sx={{ color: '#fc3f1d', fontSize: 24 }}>
            Я
          </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
};
