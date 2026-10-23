import type { Client, Table } from '@perspective-dev/client';
import { afterEach, expect, it, vi } from 'vitest';
import { disposeChartTable } from '../src/entity/ChartViewer/perspective';

const mocks = vi.hoisted(() => ({ initServer: vi.fn(), initClient: vi.fn() }));
vi.mock('@perspective-dev/client', () => ({
  default: { init_server: mocks.initServer },
}));
vi.mock('@perspective-dev/viewer', () => ({
  default: { init_client: mocks.initClient },
}));
vi.mock('@perspective-dev/viewer-datagrid', () => ({}));
vi.mock('@perspective-dev/viewer-charts', () => ({}));

afterEach(() => vi.unstubAllGlobals());

it('initializes WASM only once for concurrent charts', async () => {
  vi.resetModules();
  const { initializePerspective } =
    await import('../src/entity/ChartViewer/perspective');
  const bytes = new ArrayBuffer(8);
  const fetchWasm = vi
    .fn()
    .mockResolvedValue({ ok: true, arrayBuffer: async () => bytes });
  vi.stubGlobal('fetch', fetchWasm);
  const first = initializePerspective();
  expect(initializePerspective()).toBe(first);
  await first;
  expect(fetchWasm).toHaveBeenCalledTimes(2);
  expect(mocks.initServer).toHaveBeenCalledExactlyOnceWith(bytes);
  expect(mocks.initClient).toHaveBeenCalledOnce();
});

it('allows another mount to retry a failed WASM download', async () => {
  vi.resetModules();
  const { initializePerspective } =
    await import('../src/entity/ChartViewer/perspective');
  const fetchWasm = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(8),
    })
    .mockResolvedValueOnce({ ok: false });
  vi.stubGlobal('fetch', fetchWasm);
  await expect(initializePerspective()).rejects.toThrow(
    'Не удалось загрузить движок графика',
  );
  expect(mocks.initServer).not.toHaveBeenCalled();
  await initializePerspective();
  expect(mocks.initServer).toHaveBeenCalledOnce();
});

it('waits for actual table deletion before terminating and freeing its client', async () => {
  const client = { terminate: vi.fn(), free: vi.fn() };
  let deleted!: () => void;
  const table = {
    on_delete: vi.fn(async (callback: () => void) => {
      deleted = callback;
    }),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const disposing = disposeChartTable(
    client as unknown as Client,
    table as unknown as Table,
  );
  await vi.waitFor(() =>
    expect(table.delete).toHaveBeenCalledWith({ lazy: true }),
  );
  expect(client.terminate).not.toHaveBeenCalled();
  deleted();
  await disposing;
  expect(client.terminate).toHaveBeenCalledOnce();
  expect(client.free).toHaveBeenCalledOnce();
});

it('terminates the worker even when table deletion fails', async () => {
  const client = { terminate: vi.fn(), free: vi.fn() };
  const table = {
    on_delete: vi.fn().mockResolvedValue(1),
    delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
  };
  await expect(
    disposeChartTable(client as unknown as Client, table as unknown as Table),
  ).rejects.toThrow('Delete failed');
  expect(client.terminate).toHaveBeenCalledOnce();
  expect(client.free).toHaveBeenCalledOnce();
});

it('terminates a worker without a table', async () => {
  const client = { terminate: vi.fn(), free: vi.fn() };
  await disposeChartTable(client as unknown as Client);
  expect(client.terminate).toHaveBeenCalledOnce();
  expect(client.free).toHaveBeenCalledOnce();
});
