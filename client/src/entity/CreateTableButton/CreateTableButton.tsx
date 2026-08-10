import { type ReactNode } from "react";
import { Button, type ButtonProps } from "@mui/material";
import { SiGooglesheets } from "react-icons/si";
import { FaTableList, FaFileCirclePlus } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { Typography } from "@mui/material";

export type CrateTableButtonProps = ButtonProps & {
  view: "google-sheets" | "excel-csv" | "template-table" | "blank-table";
  selected?: boolean;
};

const iconViewMatcher: { [key in CrateTableButtonProps["view"]]: ReactNode } = {
  "google-sheets": <SiGooglesheets transform="scale(2)" />,
  "excel-csv": <RiFileExcel2Fill transform="scale(2)" />,
  "template-table": <FaTableList transform="scale(2)" />,
  "blank-table": <FaFileCirclePlus transform="scale(2)" />,
};

const labelViewMatcher: { [key in CrateTableButtonProps["view"]]: string } = {
  "google-sheets": "google sheets",
  "excel-csv": "Excel/CSV",
  "template-table": "Шаблон таблицы",
  "blank-table": "Пустая таблица",
};

export const CreateTableButton = ({
  view,
  selected,
  ...props
}: CrateTableButtonProps) => {
  return (
    <Button
      sx={{
        width: "200px",
        height: "100px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        paddingTop: "16px",
        border: "1px solid rgb(169 162 168 / 1)",
      }}
      variant={selected ? "contained" : "outlined"}
      {...props}
    >
      {iconViewMatcher[view]}

      <Typography variant="button" mt={1}>
        {labelViewMatcher[view]}
      </Typography>
    </Button>
  );
};
