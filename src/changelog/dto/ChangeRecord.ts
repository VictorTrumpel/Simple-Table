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

export type ChangeCellDTO = {
  before: string;
  after: string;
  columnId: string;
  rowId: string;
  tableId: string;
};

export type ChangeRecord = {
  changeType: 'add' | 'delete' | 'update';
  before: null | string;
  after: null | string;
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
