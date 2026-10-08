import { tableService, type CreateColumnDTO } from '@shared/network';

export const useViewModel = () => {
  const editColumn = async (
    tableId: string,
    col: {
      id: string;
      name: string;
      type: string;
      enum: string[];
    },
    forceUpdate?: boolean,
  ) => {
    return await tableService.editColInfo(tableId, col, forceUpdate);
  };

  const handleSave = async (tableId: string, column: CreateColumnDTO) => {
    return await tableService.createColumn(tableId, column);
  };

  return { editColumn, handleSave };
};
