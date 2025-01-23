import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { Stack } from '@mui/material';

import { PostCard } from './board-post-card';

interface Props {
  postItems: RealtimePaginationQuery['realtimePagination'];
  onClickCard: (boardId: string[], site: string) => void;
}

export const PostList = ({ postItems, onClickCard }: Props) => (
  <Stack spacing={2.8}>
    {postItems &&
      postItems.map(
        (post, index) =>
          post && (
            <PostCard
              key={index}
              onClickToggle={onClickCard}
              id={post.boardId}
              // rank={post.rank && post.rank as string}
              site={post.site as string}
              title={post.title as string}
              url={post.url as string}
              createTime={post.createTime}
              gptAnswer={post.gptAnswer as string}
            />
          )
      )}
  </Stack>
);
