import { tableService } from "@shared/network";

export const useViewModel = () => {
  const addRow = async (tableId: string, row: Record<string, unknown>) => {
    return await tableService.addRow(tableId, row);
  };

  return { addRow };
};
