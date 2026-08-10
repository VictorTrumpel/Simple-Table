import { Button, type ButtonProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";

type MenuTabProps = ButtonProps & {
  active?: boolean;
};

export const MenuTab = ({ active, ...props }: MenuTabProps) => {
  const theme = useTheme();

  return (
    <Button
      sx={{
        "& .MuiButton-icon": {
          marginRight: "2px",
          color: active ? theme.palette.primary.dark : theme.palette.grey[600],
        },
        background: active ? theme.alpha(theme.palette.primary.light, 0.2) : "",
        color: active ? theme.palette.grey[900] : theme.palette.grey[600],
      }}
      size="small"
      {...props}
    >
      {props.children}
    </Button>
  );
};
