import { databaseService } from "@shared/network";

export const useViewModel = () => {
  const setDbRole = async (dbId: string, userId: string, role: string) => {
    return await databaseService.setRole(dbId, userId, role);
  };

  return { setDbRole };
};
