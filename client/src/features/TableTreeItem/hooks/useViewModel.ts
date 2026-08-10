import { tableService } from "@shared/network";

export const useViewModel = () => {
  const deleteTable = async (tableId: string) => {
    return await tableService.deleteTable(tableId);
  };

  return { deleteTable };
};
