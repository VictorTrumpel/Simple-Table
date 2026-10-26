import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { IconButton, Tooltip } from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import { useSnackbar } from 'notistack';

type GoogleAuthProps = {
  onSuccess: (credential: string) => void;
};

export const GoogleAuth = ({ onSuccess }: GoogleAuthProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  const handleError = () => {
    enqueueSnackbar('Не удалось войти через Google. Попробуйте ещё раз.', {
      variant: 'error',
    });
  };

  if (!clientId) {
    return (
      <Tooltip title="Вход через Google временно недоступен">
        <span>
          <IconButton
            type="button"
            aria-label="Войти через Google"
            disabled
            sx={{ width: 40, height: 40, border: '1px solid #dadce0' }}
          >
            <FcGoogle size={20} />
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <GoogleOAuthProvider
      clientId={clientId}
      locale="ru"
      onScriptLoadError={handleError}
    >
      <GoogleLogin
        type="icon"
        shape="circle"
        size="large"
        theme="outline"
        text="signin_with"
        ux_mode="popup"
        containerProps={{ style: { width: 40, height: 40 } }}
        onSuccess={({ credential }) => {
          if (!credential) {
            handleError();
            return;
          }

          onSuccess(credential);
        }}
        onError={handleError}
      />
    </GoogleOAuthProvider>
  );
};
