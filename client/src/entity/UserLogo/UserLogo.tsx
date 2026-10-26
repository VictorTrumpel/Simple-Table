import { Box, Avatar, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

type UserLogoProps = {
  name: string;
  src?: string | null;
};

export const UserLogo = ({ name, src }: UserLogoProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar alt={name} src={src || undefined}>
        <PersonIcon />
      </Avatar>

      <Typography variant="overline" sx={{ display: "block" }}>
        {name}
      </Typography>
    </Box>
  );
};
