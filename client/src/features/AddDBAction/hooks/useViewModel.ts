import { treeDatabaseService } from "@shared/network";

export const useViewModel = () => {
  const createDatabase = (dbName: string) => {
    return treeDatabaseService.addDatabase(dbName);
  };

  return { createDatabase };
};
