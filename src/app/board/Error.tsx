import { ApolloError } from "@apollo/client";
import { Grid, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface props {
    message: string
    isMobile: boolean
}

export const Error = ({message, isMobile}: props) => {
    if (message) {
      const statusCodeMatch =
        message.match(/\b\d{3}\b/);

      return (
        <Grid container direction="column" width="100%" height="100vh" top="0" left="0" 
              spacing={2} margin="0" justifyContent="center" alignItems="center" gap="10px">
          <Grid container direction="row" width={isMobile ? "auto" : "calc(100vh - 250px)"} 
                alignItems="center" justifyContent="center" gap="10px">
            <ErrorOutlineIcon color="primary" sx={{ fontSize: "80px" }} />
            <Typography variant="h3" color="primary">
              {statusCodeMatch}
            </Typography>
          </Grid>
          {isMobile ? (
            <></>
          ) : (
            <Typography variant="h6" component="div" color="gray" paragraph 
                        width={isMobile ? "260px" : "auto"} textAlign="center">
              {message}
            </Typography>
          )}
        </Grid>
      );
    } else return <p>에러는 발생하였으나 추적이 어렵습니다.</p>
  };