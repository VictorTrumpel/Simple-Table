import { useEffect, useRef } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FaGithub } from 'react-icons/fa6';
import { useSnackbar } from 'notistack';

type GithubAuthProps = {
  onSuccess: (code: string) => Promise<void>;
  disabled?: boolean;
};

const OAUTH_STATE_KEY = 'simple-table:github-oauth-state';

const getRedirectUri = () => `${window.location.origin}/`;

export const GithubAuth = ({
  onSuccess,
  disabled = false,
}: GithubAuthProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID?.trim();
  const onSuccessRef = useRef(onSuccess);
  const enqueueSnackbarRef = useRef(enqueueSnackbar);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    enqueueSnackbarRef.current = enqueueSnackbar;
  }, [onSuccess, enqueueSnackbar]);

  useEffect(() => {
    if (!clientId) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (!code && !error) return;

    const expectedState = sessionStorage.getItem(OAUTH_STATE_KEY);
    sessionStorage.removeItem(OAUTH_STATE_KEY);

    // Do not keep the authorization code in the address bar or browser history.
    ['code', 'state', 'error', 'error_description'].forEach((key) =>
      params.delete(key),
    );
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );

    if (error) {
      enqueueSnackbarRef.current(
        error === 'access_denied'
          ? 'Вход через GitHub отменён.'
          : 'Не удалось войти через GitHub. Попробуйте ещё раз.',
        { variant: 'error' },
      );
      return;
    }

    if (!code || !state || state !== expectedState) {
      enqueueSnackbarRef.current(
        'Не удалось войти через GitHub. Попробуйте ещё раз.',
        { variant: 'error' },
      );
      return;
    }

    onSuccessRef.current(code).catch(() => {
      enqueueSnackbarRef.current(
        'Не удалось войти через GitHub. Попробуйте ещё раз.',
        { variant: 'error' },
      );
    });
  }, [clientId]);

  const handleLogin = () => {
    if (!clientId) return;

    const state = crypto.randomUUID();
    sessionStorage.setItem(OAUTH_STATE_KEY, state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      scope: 'read:user user:email',
      state,
    });

    window.location.assign(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  };

  return (
    <Tooltip
      title={
        clientId
          ? 'Войти через GitHub'
          : 'Вход через GitHub временно недоступен'
      }
    >
      <span>
        <IconButton
          type="button"
          aria-label="Войти через GitHub"
          disabled={!clientId || disabled}
          onClick={handleLogin}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid #dadce0',
            color: '#181717',
          }}
        >
          <FaGithub size={22} />
        </IconButton>
      </span>
    </Tooltip>
  );
};
