"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChangeEvent, useState } from "react";

export default function Login() {
  const [user, setUser] = useState({
    userId: "",
    userPw: "",
  });
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="sm"
      sx={{
        height: isMobile ? "auto" : "100vh",
        display: "flex",
        alignItems: isMobile ? "inherit" : "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexFlow: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3">Instagram Login</Typography>
        <TextField
          label="Id"
          variant="outlined"
          value={user.userId}
          fullWidth
          margin="normal"
          name="userId"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUser({ ...user, userId: e.target.value })
          }
          autoFocus
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={user.userPw}
          fullWidth
          margin="normal"
          name="userPw"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUser({ ...user, userPw: e.target.value })
          }
        />
        <Button
          variant="contained"
          color="inherit"
          fullWidth
          sx={{
            marginTop: "16px",
            marginBottom: "8px",
            paddingX: "16.5px",
            paddingY: "14px",
            "&:hover": {
              backgroundColor: "primary.main",
              color: "#fff",
            },
          }}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
}
