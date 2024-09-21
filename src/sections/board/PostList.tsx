import { RealtimePaginationQuery } from 'src/__generated__/graphql';
import { PostCard } from './PostCard';

interface Props {
  postItems: RealtimePaginationQuery['realtimePagination'];
  onClickCard: (boardId: string, stie: string) => void;
}

export const PostList = ({ postItems, onClickCard }: Props) => (
  <>
    {postItems &&
      postItems.map(
        (post, index) =>
          post && (
            <PostCard
              key={index}
              onClickToggle={onClickCard}
              id={post.boardId as string}
              rank={post.rank as string}
              site={post.site as string}
              title={post.title as string}
              url={post.url as string}
              createTime={post.createTime}
              GPTAnswer={post.GPTAnswer as string}
            />
          )
      )}
  </>
);
