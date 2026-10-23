import { StrictMode, type ComponentProps } from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ChartViewer } from '../src/entity/ChartViewer/ChartViewer';

const mocks = vi.hoisted(() => ({
  initialize: vi.fn(),
  worker: vi.fn(),
  dispose: vi.fn(),
  viewer: vi.fn(),
}));

vi.mock('@perspective-dev/client', () => ({
  default: { worker: mocks.worker },
}));
vi.mock('../src/entity/ChartViewer/perspective', () => ({
  initializePerspective: mocks.initialize,
  disposeChartTable: mocks.dispose,
}));
vi.mock('@perspective-dev/react', () => ({
  PerspectiveViewer: (props: unknown) => {
    mocks.viewer(props);
    return <div data-testid="viewer" />;
  },
}));

const data = [{ category: 'A', value: 42 }];
const table = { name: 'chart' };
const client = { table: vi.fn() };

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

beforeEach(() => {
  mocks.initialize.mockResolvedValue(undefined);
  mocks.worker.mockResolvedValue(client);
  mocks.dispose.mockResolvedValue(undefined);
  client.table.mockReset().mockResolvedValue(table);
});
afterEach(cleanup);

it('passes the created table to PerspectiveViewer and disposes it on unmount', async () => {
  const view = render(<ChartViewer data={data} />);
  await screen.findByTestId('viewer');
  expect(client.table).toHaveBeenCalledWith(data);
  expect(mocks.viewer).toHaveBeenLastCalledWith(
    expect.objectContaining({ client: table }),
  );

  view.unmount();
  await waitFor(() =>
    expect(mocks.dispose).toHaveBeenCalledExactlyOnceWith(client, table),
  );
});

it('uses the default config when no config is provided', async () => {
  render(<ChartViewer data={data} />);
  await screen.findByTestId('viewer');
  expect(mocks.viewer).toHaveBeenLastCalledWith(
    expect.objectContaining({ config: { plugin: 'Y Line', settings: true } }),
  );
});

it('overrides defaults with the provided config and forwards changes', async () => {
  const onConfigUpdate = vi.fn();
  render(
    <ChartViewer
      data={data}
      config={{ plugin: 'Y Bar', settings: false, columns: ['value'] }}
      onConfigUpdate={onConfigUpdate}
    />,
  );
  await screen.findByTestId('viewer');
  const props = mocks.viewer.mock.lastCall![0] as ComponentProps<
    typeof import('@perspective-dev/react').PerspectiveViewer
  >;
  expect(props.config).toEqual({
    plugin: 'Y Bar',
    settings: false,
    columns: ['value'],
  });
  const nextConfig = { plugin: 'X Bar', settings: true };
  props.onConfigUpdate!(nextConfig);
  expect(onConfigUpdate).toHaveBeenCalledExactlyOnceWith(nextConfig);
});

it('does not create a worker when unmounted during WASM initialization', async () => {
  const pending = deferred<void>();
  mocks.initialize.mockReturnValueOnce(pending.promise);
  const view = render(<ChartViewer data={data} />);
  view.unmount();
  await act(async () => pending.resolve());
  expect(mocks.worker).not.toHaveBeenCalled();
});

it('terminates a client that finishes creating after unmount', async () => {
  const pending = deferred<typeof client>();
  mocks.worker.mockReturnValueOnce(pending.promise);
  const view = render(<ChartViewer data={data} />);
  await waitFor(() => expect(mocks.worker).toHaveBeenCalledOnce());
  view.unmount();
  await act(async () => pending.resolve(client));
  expect(client.table).not.toHaveBeenCalled();
  expect(mocks.dispose).toHaveBeenCalledExactlyOnceWith(client, undefined);
});

it('deletes a table that finishes creating after unmount', async () => {
  const pending = deferred<typeof table>();
  client.table.mockReturnValueOnce(pending.promise);
  const view = render(<ChartViewer data={data} />);
  await waitFor(() => expect(client.table).toHaveBeenCalledOnce());
  view.unmount();
  await act(async () => pending.resolve(table));
  expect(mocks.dispose).toHaveBeenCalledExactlyOnceWith(client, table);
});

it('disposes the client immediately when table creation fails', async () => {
  client.table.mockRejectedValueOnce(new Error('Invalid data'));
  const view = render(<ChartViewer data={data} />);
  await screen.findByText('Не удалось отобразить график');
  expect(mocks.dispose).toHaveBeenCalledExactlyOnceWith(client, undefined);
  view.unmount();
  await act(async () => {});
  expect(mocks.dispose).toHaveBeenCalledOnce();
});

it('releases the old resources when data changes', async () => {
  const view = render(<ChartViewer data={data} />);
  await screen.findByTestId('viewer');
  const nextTable = { name: 'next' };
  client.table.mockResolvedValueOnce(nextTable);
  view.rerender(<ChartViewer data={[{ category: 'B', value: 7 }]} />);
  await waitFor(() =>
    expect(mocks.viewer).toHaveBeenLastCalledWith(
      expect.objectContaining({ client: nextTable }),
    ),
  );
  expect(mocks.dispose).toHaveBeenCalledWith(client, table);
});

it('does not leak resources during StrictMode effect replay', async () => {
  const view = render(
    <StrictMode>
      <ChartViewer data={data} />
    </StrictMode>,
  );
  await screen.findByTestId('viewer');
  expect(mocks.worker).toHaveBeenCalledOnce();
  view.unmount();
  await waitFor(() =>
    expect(mocks.dispose).toHaveBeenCalledExactlyOnceWith(client, table),
  );
});
