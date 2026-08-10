export type ChangeColumnItem = {
  name: string;
  type: string;
  id: string;
  enum: null | string[];
};

export type ChangeRowItemDTO = {
  columnID: string;
  columnName: string;
  value: string;
};

export type GetChangeItemDTO = {
  changeId: number;
  changedEntity: "row" | "column";
  changeType: "add" | "delete" | "update";
  beforeColumn: null | ChangeColumnItem;
  afterColumn: null | ChangeColumnItem;
  beforeRow: null | ChangeRowItemDTO[];
  afterRow: null | ChangeRowItemDTO[];
  changedAt: string;
  user: {
    id: 1;
    name: string;
    email: string;
    createdAt: string;
  };
};
