import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type GridRowId } from "@mui/x-data-grid";

type State = {
  selectedRowIds: GridRowId[];
};

const initialState: State = {
  selectedRowIds: [],
};

export const tableSlice = createSlice({
  name: "tableSlice",
  initialState,
  reducers: {
    setSelectedRows: (state, { payload }: PayloadAction<GridRowId[]>) => {
      state.selectedRowIds = payload;
    },
  },
});

export const tableActions = tableSlice.actions;
