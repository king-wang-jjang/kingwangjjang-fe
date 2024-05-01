import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export const TemporaryDrawer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [filterItem, setFilterItem] = useState<string[]>([]);

  const handleFilter = (items: string) => {
    if (filterItem.includes(items)) {
      setFilterItem(filterItem.filter((item) => item !== items));
    } else {
      setFilterItem([...filterItem, items]);
    }
  };

  const filters = ["dcinside", "ygosu", "ppomppu"];

  return (
    <Box flex="1" width={isMobile ? "300px" : "auto"} height="100vh">
      <List>
        <ListItem>
          <Typography variant="h6" component="div">
            필터
          </Typography>
        </ListItem>
      </List>
      <Divider />
      <List>
        <Stack direction="row" spacing={1} paddingX="8px">
          {filters.map((filter, index) => (
            <Chip
              key={index}
              label={filter}
              onClick={() => handleFilter(filter)}
            />
          ))}
        </Stack>
      </List>
      <Divider />
      <List>
        <ListItem>
          <Typography variant="h6" component="div">
            실시간 게시글
          </Typography>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <Link href={"/board/1"}>testlink</Link>
        </ListItem>
      </List>
    </Box>
  );
};
