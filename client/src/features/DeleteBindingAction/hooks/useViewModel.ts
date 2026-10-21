import { chartService } from '@shared/network';

export const useViewModel = () => {
  const deleteBinding = (chartId: string, bindingId: number) => {
    return chartService.deleteBinding(chartId, bindingId);
  };

  return { deleteBinding };
};
