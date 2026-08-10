import { createContext, useContext } from "react";
import type { GetTableDataDTO } from "@shared/network";

const TableInfoContext = createContext<GetTableDataDTO | null>(null);

export const TableInfoProvider = TableInfoContext.Provider;

export const useTableInfoContext = () => {
  const context = useContext(TableInfoContext);

  // if (!context) throw new Error("Missed TableInfoContext!");

  return context;
};
