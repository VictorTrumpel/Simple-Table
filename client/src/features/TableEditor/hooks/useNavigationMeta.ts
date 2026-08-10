import type { GridSortModel } from "@mui/x-data-grid";
import { useState } from "react";

export type PaginationMeta = {
  page: number;
  pageSize: number;
};

export type SortMeta = {
  field: string;
  sort: "asc" | "desc" | null | undefined;
};

export const useNavigationMeta = () => {
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: 100,
  });

  const [sortMeta, setSortMeta] = useState<SortMeta>({
    field: "",
    sort: undefined,
  });

  const [filterCol, setFilterCol] = useState<undefined | string>(undefined);
  const [filterText, setFilterText] = useState<undefined | string>(undefined);

  const handleSort = (sortModel: GridSortModel) => {
    const newMeta = sortModel[0];

    if (newMeta) {
      setSortMeta(sortModel[0]);
      return;
    }

    setSortMeta({ field: "", sort: undefined });
  };

  return {
    filterCol,
    filterText,
    paginationMeta,
    sortMeta,
    setFilterCol,
    setFilterText,
    setPaginationMeta,
    handleSort,
  };
};
