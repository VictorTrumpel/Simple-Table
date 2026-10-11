import { tableService } from "@shared/network";

export const useViewModel = () => {
  const addTable = async (dbId: string, tableName: string) => {
    return await tableService.addEmptyTableToDatabase(tableName, dbId);
  };

  const addTableViaFile = async (
    dbId: string,
    tableName: string,
    file: File
  ) => {
    return await tableService.addTableViaFile(dbId, tableName, file);
  };

  return { addTable, addTableViaFile };
};
