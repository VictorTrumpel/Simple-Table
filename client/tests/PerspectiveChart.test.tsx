import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PerspectiveChart } from '../src/features/PerspectiveChart/PerspectiveChart';

const mocks = vi.hoisted(() => ({ getData: vi.fn(), viewer: vi.fn() }));
vi.mock('@shared/network', () => ({
  chartService: { getData: mocks.getData },
}));
vi.mock('@entity', () => ({
  ChartViewer: (props: unknown) => {
    mocks.viewer(props);
    return <div data-testid="chart" />;
  },
}));
afterEach(cleanup);

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
  await act(async () => finish({ data, error: null }));
  screen.getByTestId('chart');
  expect(mocks.viewer).toHaveBeenLastCalledWith({ data });
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
  view.unmount();
  expect(signal.aborted).toBe(true);
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
