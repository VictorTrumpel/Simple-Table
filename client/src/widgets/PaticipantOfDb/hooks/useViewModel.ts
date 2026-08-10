import { databaseService } from "@shared/network";

export const useViewModel = () => {
  const fetchUsersOfDb = async (dbId: string) => {
    return await databaseService.fetchDbUsers(dbId);
  };

  const checkRole = async (dbId: string) => {
    return await databaseService.getRole(dbId);
  };

  return { fetchUsersOfDb, checkRole };
};
