import React from 'react';

import { List, ListItem, Typography } from '@mui/material';

import { PostList } from './board-post-list';

export const RealtimePost = () => {
  const postItems: any['postItems'] = [];
  const onClickCard: any['onClickCard'] = () => {};

  return (
    <>
      <List>
        <ListItem>
          <Typography variant="body1" component="div">
            인기게시글
          </Typography>
        </ListItem>
      </List>
      <List>
        <PostList postItems={postItems} onClickCard={onClickCard} loading={false} />
      </List>
    </>
  );
};
