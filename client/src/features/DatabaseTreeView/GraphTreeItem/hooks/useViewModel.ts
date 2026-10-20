import { chartService } from '@shared/network';

export const useViewModel = () => {
  const addGraph = async (dbId: string, graphName: string) => {
    return await chartService.addEmptyChartToDatabase(graphName, dbId);
  };

  return { addGraph };
};
