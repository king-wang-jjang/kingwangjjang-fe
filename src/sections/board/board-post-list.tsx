import { Stack } from '@mui/material';

import { PostCardSkeleton } from 'src/components/loading-screen/PostCardSkeleton';

import { PostCard } from './board-post-card';

interface Props {
  postItems?: any[];
  onClickCard: (boardId: string, site: string) => void;
  onCommentClick?: (boardId: string, site: string) => void;
  loading: boolean;
}

export const PostList = ({ postItems, onClickCard, onCommentClick, loading }: Props) => (
  <Stack spacing={1}>
    {loading
      ? Array.from({ length: 5 }).map((_, index) => <PostCardSkeleton key={index} />)
      : postItems?.map(
          (post, index) =>
            post && (
              <PostCard
                key={index}
                onClickToggle={onClickCard}
                onCommentClick={onCommentClick}
                boardId={post.Id || ''}
                site={post.site as string}
                title={post.title as string}
                url={post.url as string}
                createTime={post.createTime}
                gptAnswer={post.gptAnswer as string}
                thumbnail={post.thumbnail as string}
                commentCount={post.commentCount as number}
                likeCount={post.likeCount as number}
              />
            )
        )}
  </Stack>
);
