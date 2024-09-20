import { List, ListItem, Typography } from '@mui/material'
import React from 'react'

export const RealtimePost = () => {
  return (
    <>
    <List>
          <ListItem>
              <Typography variant="body1" color={"gray"} component="div">
                  실시간 게시글
              </Typography>
          </ListItem>
        </List><List>
            <ListItem>test1</ListItem>
            <ListItem>test2</ListItem>
            <ListItem>test3</ListItem>
        </List>
    </>
  )
}
