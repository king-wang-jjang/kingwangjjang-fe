import { Grid, useMediaQuery, useTheme } from "@mui/material";

export const Loading = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid container direction="column" width="100%" height={isMobile ? "calc(100vh - 56px)" : "100vh"}
          position="absolute" top="0" left="0" spacing={2} margin="0" justifyContent="center" alignItems="center">
      Loading...
    </Grid>
  );
};
