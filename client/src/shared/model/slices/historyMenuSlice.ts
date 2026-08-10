import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type State = {
  isActive: boolean;
};

const initialState: State = {
  isActive: false,
};

export const historyMenuSlice = createSlice({
  name: "historyMenuSlice",
  initialState,
  reducers: {
    setActive: (state, { payload }: PayloadAction<boolean>) => {
      state.isActive = payload;
    },
  },
});

export const historyMenuActions = historyMenuSlice.actions;
