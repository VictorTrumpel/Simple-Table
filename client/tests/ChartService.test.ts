import { expect, it, vi } from 'vitest';
import { chartService } from '../src/shared/network/services/ChartService';

const mocks = vi.hoisted(() => ({ get: vi.fn(), put: vi.fn() }));
vi.mock('../src/shared/network/shared/network', () => ({ network: mocks }));

it('loads chart metadata from the chart endpoint', async () => {
  const metadata = { id: 12, config: { plugin: 'Y Bar', settings: false } };
  mocks.get.mockResolvedValueOnce({ data: metadata });
  const signal = new AbortController().signal;
  await expect(chartService.getChartMeta('12', signal)).resolves.toEqual({
    data: metadata,
    error: null,
  });
  expect(mocks.get).toHaveBeenCalledExactlyOnceWith('/charts/12', { signal });
});

it('wraps the updated config in the payload expected by the API', async () => {
  const config = { plugin: 'Y Bar', settings: false };
  mocks.put.mockResolvedValueOnce({ data: '' });
  await expect(chartService.updateConfig('12', config)).resolves.toEqual({
    data: '',
    error: null,
  });
  expect(mocks.put).toHaveBeenCalledExactlyOnceWith('/charts/12/config', {
    config,
  });
});

it('returns config save errors to the caller', async () => {
  const error = new Error('Network error');
  mocks.put.mockRejectedValueOnce(error);
  await expect(chartService.updateConfig('12', {})).resolves.toEqual({
    data: null,
    error,
  });
});
