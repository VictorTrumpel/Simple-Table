import { userService } from "@shared/network";
import { databaseService } from "@shared/network";

export const useViewModel = () => {
  const fetchAllUserList = async () => {
    return await userService.getAllUsers();
  };

  const addUserInDb = async (
    dbId: string,
    user: { id: string },
    role: string
  ) => {
    return await databaseService.setRole(dbId, user.id, role);
  };

  return { fetchAllUserList, addUserInDb };
};
