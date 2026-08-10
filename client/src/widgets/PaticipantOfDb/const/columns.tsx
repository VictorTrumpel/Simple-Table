import type { GridColDef } from "@mui/x-data-grid";

export const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Имя",
  },
  {
    field: "email",
    headerName: "Email",
  },
  {
    field: "role",
    headerName: "Роль",
    renderCell: () => {
      return <>HE</>;
    },
  },
];
