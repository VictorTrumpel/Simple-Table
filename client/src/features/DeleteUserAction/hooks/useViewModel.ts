import { databaseService } from "@shared/network";

export const useViewModel = () => {
  const deleteUser = async (dbId: string, userId: string) => {
    return await databaseService.deleteUser(dbId, userId);
  };

  return { deleteUser };
};
