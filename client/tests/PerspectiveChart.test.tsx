import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { PerspectiveChart } from '../src/features/PerspectiveChart/PerspectiveChart';

const mocks = vi.hoisted(() => ({
  getData: vi.fn(),
  getChartMeta: vi.fn(),
  updateConfig: vi.fn(),
  viewer: vi.fn(),
  enqueueSnackbar: vi.fn(),
}));
vi.mock('@shared/network', () => ({
  chartService: {
    getData: mocks.getData,
    getChartMeta: mocks.getChartMeta,
    updateConfig: mocks.updateConfig,
  },
}));
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mocks.enqueueSnackbar }),
}));
vi.mock('@entity', () => ({
  ChartViewer: (props: unknown) => {
    mocks.viewer(props);
    return <div data-testid="chart" />;
  },
}));
const config = { plugin: 'Y Bar', settings: false, columns: ['value'] };
beforeEach(() => {
  mocks.getChartMeta.mockResolvedValue({ data: { config }, error: null });
  mocks.updateConfig.mockResolvedValue({ data: null, error: null });
});
afterEach(cleanup);

const updateConfig = () =>
  (
    mocks.viewer.mock.lastCall![0] as ComponentProps<
      typeof import('../src/entity/ChartViewer/ChartViewer').ChartViewer
    >
  ).onConfigUpdate!;

it('shows a loader while requesting the selected chart and passes data to ChartViewer', async () => {
  const data = [{ name: 'A', value: 12 }];
  let finish!: (value: { data: typeof data; error: null }) => void;
  mocks.getData.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(<PerspectiveChart chartId="12" />);
  screen.getByRole('progressbar', { name: 'Загрузка данных графика' });
  expect(mocks.getData).toHaveBeenCalledWith('12', expect.any(AbortSignal));
  expect(mocks.getChartMeta).toHaveBeenCalledWith(
    '12',
    expect.any(AbortSignal),
  );
  await act(async () => finish({ data, error: null }));
  screen.getByTestId('chart');
  expect(mocks.viewer).toHaveBeenLastCalledWith({
    data,
    config,
    settingsEnabled: true,
    onConfigUpdate: expect.any(Function),
  });
});

it('disables settings and saving config for a reader', async () => {
  mocks.getData.mockResolvedValueOnce({ data: [{ value: 12 }], error: null });
  render(<PerspectiveChart chartId="12" settingsEnabled={false} />);
  await screen.findByTestId('chart');
  expect(mocks.viewer).toHaveBeenLastCalledWith(expect.objectContaining({
    settingsEnabled: false,
    onConfigUpdate: undefined,
  }));
  expect(mocks.updateConfig).not.toHaveBeenCalled();
});

it('waits for metadata before displaying the chart', async () => {
  let finish!: (value: unknown) => void;
  mocks.getData.mockResolvedValueOnce({ data: [{ value: 12 }], error: null });
  mocks.getChartMeta.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(<PerspectiveChart chartId="12" />);
  await act(async () => {});
  expect(screen.queryByTestId('chart')).toBeNull();
  await act(async () => finish({ data: { config }, error: null }));
  screen.getByTestId('chart');
});

it('saves config changes in order without reloading the chart', async () => {
  let finish!: (value: unknown) => void;
  mocks.getData.mockResolvedValueOnce({ data: [{ value: 12 }], error: null });
  mocks.updateConfig.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(<PerspectiveChart chartId="12" />);
  await screen.findByTestId('chart');
  const first = { plugin: 'X Bar' };
  const second = { plugin: 'Y Line' };
  act(() => {
    updateConfig()(first);
    updateConfig()(second);
  });
  await waitFor(() =>
    expect(mocks.updateConfig).toHaveBeenCalledExactlyOnceWith('12', first),
  );
  await act(async () => finish({ data: null, error: null }));
  expect(mocks.updateConfig).toHaveBeenNthCalledWith(2, '12', second);
  expect(mocks.getData).toHaveBeenCalledOnce();
  expect(mocks.getChartMeta).toHaveBeenCalledOnce();
});

it('reports save errors and allows saving subsequent changes', async () => {
  mocks.getData.mockResolvedValueOnce({ data: [{ value: 12 }], error: null });
  mocks.updateConfig.mockResolvedValueOnce({
    data: null,
    error: new Error('Network error'),
  });
  render(<PerspectiveChart chartId="12" />);
  await screen.findByTestId('chart');
  await act(async () => updateConfig()({ settings: false }));
  expect(mocks.enqueueSnackbar).toHaveBeenCalledWith(
    'Не удалось сохранить настройки графика!',
    { variant: 'error' },
  );
  await act(async () => updateConfig()({ settings: true }));
  expect(mocks.updateConfig).toHaveBeenNthCalledWith(2, '12', {
    settings: true,
  });
});

it.each([
  { data: null, error: new Error('Metadata request failed') },
  { data: null, error: null },
])('shows an error if metadata is unavailable: %j', async (response) => {
  mocks.getData.mockResolvedValueOnce({ data: [{ value: 12 }], error: null });
  mocks.getChartMeta.mockResolvedValueOnce(response);
  render(<PerspectiveChart chartId="12" />);
  await screen.findByRole('alert');
  expect(screen.queryByTestId('chart')).toBeNull();
});

it.each([[], null])('shows the empty state for %j', async (data) => {
  mocks.getData.mockResolvedValueOnce({ data, error: null });
  render(<PerspectiveChart chartId="12" />);
  await screen.findByText('Нет данных для графика');
  expect(screen.queryByTestId('chart')).toBeNull();
});

it('shows request errors separately from the empty state', async () => {
  mocks.getData.mockResolvedValueOnce({
    data: null,
    error: new Error('Network error'),
  });
  render(<PerspectiveChart chartId="12" />);
  await screen.findByRole('alert');
  expect(screen.queryByText('Нет данных для графика')).toBeNull();
});

it('aborts the request on unmount', async () => {
  mocks.getData.mockReturnValueOnce(new Promise(() => {}));
  const view = render(<PerspectiveChart chartId="12" />);
  const signal = mocks.getData.mock.lastCall![1] as AbortSignal;
  const metaSignal = mocks.getChartMeta.mock.lastCall![1] as AbortSignal;
  view.unmount();
  expect(signal.aborted).toBe(true);
  expect(metaSignal.aborted).toBe(true);
});

it('ignores a stale response after navigating to another chart', async () => {
  let finishOld!: (value: unknown) => void;
  mocks.getData.mockReturnValueOnce(
    new Promise((resolve) => {
      finishOld = resolve;
    }),
  );
  mocks.getData.mockResolvedValueOnce({ data: [], error: null });
  const view = render(<PerspectiveChart chartId="12" />);
  view.rerender(<PerspectiveChart chartId="13" />);
  await screen.findByText('Нет данных для графика');
  await act(async () => finishOld({ data: [{ old: 1 }], error: null }));
  await waitFor(() => expect(screen.queryByTestId('chart')).toBeNull());
  expect(mocks.getData.mock.calls[0][1].aborted).toBe(true);
});
