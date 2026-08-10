import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TableMenuPanel = "records" | "columns" | "accesses";

type State = {
  activePanel: TableMenuPanel;
};

const initialState: State = {
  activePanel: "records",
};

export const tableMenuSlice = createSlice({
  name: "tableMenuSlice",
  initialState,
  reducers: {
    setActivePanel: (
      state,
      { payload }: PayloadAction<State["activePanel"]>
    ) => {
      state.activePanel = payload;
    },
  },
});

export const tableMenuActions = tableMenuSlice.actions;
