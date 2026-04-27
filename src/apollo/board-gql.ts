
export const GET_LIKES_INFO_QUERY = gql`
  query GetLikesInfo($boardId: String!, $site: String!, $userId: String) {
    get_likes_info(boardId: $boardId, site: $site, userId: $userId) {
      total_likes
      is_liked
    }
  }
`;
