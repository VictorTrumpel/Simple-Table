import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { LogInForm } from '../src/features/LogInForm/LogInForm';
import { userInfoSlice } from '../src/shared/model/slices/userInfoSlice';

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  network: {
    defaults: {
      headers: { common: { Authorization: undefined as string | undefined } },
    },
  },
  enqueueSnackbar: vi.fn(),
  googleSuccess: undefined as
    | ((response: { credential?: string }) => void)
    | undefined,
}));

vi.mock('../src/shared/network/shared/network', () => ({
  network: { ...mocks.network, post: mocks.post },
}));
vi.mock('@shared/network', async () => {
  const { userService } = await import('../src/shared/network/services/UserService');
  return { userService, network: mocks.network };
});
vi.mock('@shared/model', async () => {
  const { useDispatch } = await import('react-redux');
  const { userInfoActions } = await import('../src/shared/model/slices/userInfoSlice');
  return { useAppDispatch: useDispatch, userInfoActions };
});
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  GoogleLogin: ({ onSuccess }: { onSuccess: typeof mocks.googleSuccess }) => {
    mocks.googleSuccess = onSuccess;
    return (
      <button
        type="button"
        onClick={() => onSuccess?.({ credential: 'google-id-token' })}
      >
        Google
      </button>
    );
  },
}));
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mocks.enqueueSnackbar }),
}));
vi.mock('react-router-dom', () => ({ useHistory: () => ({ push: vi.fn() }) }));

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'google-client-id');
  localStorage.clear();
  mocks.network.defaults.headers.common.Authorization = undefined;
});
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

const renderForm = () => {
  const store = configureStore({ reducer: { userInfo: userInfoSlice.reducer } });
  render(
    <Provider store={store}>
      <LogInForm />
    </Provider>,
  );
  return store;
};

it('exchanges the Google credential and immediately logs in using the API token', async () => {
  const userInfo = { name: 'Test user', email: 'user@example.com' };
  let finish!: (value: unknown) => void;
  mocks.post.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const store = renderForm();

  fireEvent.click(screen.getByRole('button', { name: 'Google' }));
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('/auth/google/login', {
    googleCredential: 'google-id-token',
  });
  expect(localStorage.getItem('authToken')).toBeNull();
  expect(store.getState().userInfo.user).toBeNull();

  await act(async () => finish({ data: { token: 'app-token', userInfo } }));
  expect(localStorage.getItem('authToken')).toBe('app-token');
  expect(mocks.network.defaults.headers.common.Authorization).toBe(
    'Bearer app-token',
  );
  expect(store.getState().userInfo.user).toEqual(userInfo);
  expect(mocks.enqueueSnackbar).not.toHaveBeenCalled();
});

it('reports API errors without authenticating the user and allows retrying', async () => {
  mocks.post.mockRejectedValueOnce(new Error('Unauthorized'));
  const store = renderForm();
  fireEvent.click(screen.getByRole('button', { name: 'Google' }));

  await waitFor(() =>
    expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
      'Не удалось войти через Google. Попробуйте ещё раз.',
      { variant: 'error' },
    ),
  );
  expect(localStorage.getItem('authToken')).toBeNull();
  expect(mocks.network.defaults.headers.common.Authorization).toBeUndefined();
  expect(store.getState().userInfo.user).toBeNull();

  const userInfo = { name: 'Test user', email: 'user@example.com' };
  mocks.post.mockResolvedValueOnce({ data: { token: 'retry-token', userInfo } });
  fireEvent.click(screen.getByRole('button', { name: 'Google' }));
  await waitFor(() => expect(store.getState().userInfo.user).toEqual(userInfo));
  expect(localStorage.getItem('authToken')).toBe('retry-token');
});

it('rejects an empty Google credential before calling the API', () => {
  const store = renderForm();
  act(() => mocks.googleSuccess?.({}));
  expect(mocks.post).not.toHaveBeenCalled();
  expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
    'Не удалось войти через Google. Попробуйте ещё раз.',
    { variant: 'error' },
  );
  expect(store.getState().userInfo.user).toBeNull();
});

it('preserves email and password login', async () => {
  const userInfo = { name: 'Test user', email: 'user@example.com' };
  mocks.post.mockResolvedValueOnce({ data: { token: 'password-token', userInfo } });
  const store = renderForm();
  fireEvent.change(screen.getByLabelText('Логин'), {
    target: { value: userInfo.email },
  });
  fireEvent.change(screen.getByLabelText('Пароль'), {
    target: { value: 'password' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

  await waitFor(() => expect(store.getState().userInfo.user).toEqual(userInfo));
  expect(mocks.post).toHaveBeenCalledExactlyOnceWith('/auth/login', {
    email: userInfo.email,
    password: 'password',
  });
  expect(localStorage.getItem('authToken')).toBe('password-token');
  expect(mocks.network.defaults.headers.common.Authorization).toBe(
    'Bearer password-token',
  );
});
