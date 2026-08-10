import { tableService } from "@shared/network";

export const useViewModel = () => {
  const getTableMetaInfo = async (tableId: string) => {
    return await tableService.getTableMeta(tableId);
  };

  return { getTableMetaInfo };
};
