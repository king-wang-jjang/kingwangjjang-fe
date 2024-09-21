import React from 'react';

import { List, ListItem, Typography } from '@mui/material';

export const RealtimePost = () => (
  <>
    <List>
      <ListItem>
        <Typography variant="body1" component="div">
          실시간 게시글
        </Typography>
      </ListItem>
    </List>
    <List>
      <ListItem>test1</ListItem>
      <ListItem>test2</ListItem>
      <ListItem>test3</ListItem>
    </List>
  </>
);
