import { tableService } from "@shared/network";

export const useViewModel = () => {
  const deleteColumn = (tableId: string, columnId: string) => {
    return tableService.deleteColumn(tableId, columnId);
  };

  return { deleteColumn };
};
