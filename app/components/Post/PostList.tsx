import { List, ListItem, useMediaQuery, useTheme } from "@mui/material";
import { PostCard } from "./PostCard";
import { BoardContentsByDateQuery } from "@/app/__generated__/graphql";

interface Props {
  postItems: BoardContentsByDateQuery["boardContentsByDate"];
  onClickCard: (boardId: string, stie: string) => void;
}

export const PostList = ({ postItems, onClickCard }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <List
      sx={{
        position: "relative",
        overflow: "auto",
      }}
    >
      {postItems &&
        postItems.map(
          (post, index) =>
            post && (
              <ListItem key={index}>
                <PostCard
                  onClickToggle={onClickCard}
                  id={post.boardId as string}
                  site={post.site as string}
                  title={post.title as string}
                  url={post.url as string}
                  createTime={post.createTime}
                  GPTAnswer={post.GPTAnswer as string}
                ></PostCard>
              </ListItem>
            )
        )}
    </List>
  );
};
