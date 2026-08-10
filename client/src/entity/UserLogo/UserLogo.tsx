import { Box, Avatar, Typography } from "@mui/material";

type UserLogoProps = {
  name: string;
  src: string;
};

export const UserLogo = ({ name, src }: UserLogoProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar alt={name} src={src} />

      <Typography variant="overline" sx={{ display: "block" }}>
        {name}
      </Typography>
    </Box>
  );
};
