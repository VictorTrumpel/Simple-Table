import { treeDatabaseService } from "@shared/network";

export const useViewModel = () => {
  const getTree = async () => {
    return await treeDatabaseService.getTree();
  };

  const handleAddDatabase = () => {};

  return { getTree, handleAddDatabase };
};
