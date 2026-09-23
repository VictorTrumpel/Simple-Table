export type ChangeColumnItem = {
  name: string;
  type: string;
  id: string;
  enum: string[] | null;
};

export type ChangeRowItemDTO = {
  columnID: string;
  columnName: string;
  value: string;
};

export type ChangeRecord = {
  changeType: 'add' | 'delete' | 'update';
  beforeColumn: null | ChangeColumnItem;
  afterColumn: null | ChangeColumnItem;
  beforeRow: null | ChangeRowItemDTO[];
  afterRow: null | ChangeRowItemDTO[];
};

export type ChangeEntity = {
  tableId: string;
  userId: string;
  rowId: string;
};
