import { useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { commentServiceClient } from 'src/apollo';
import { GET_COMMENTS } from 'src/apollo/comment-gql';

type UseCommentsParams = {
  boardId: string;
  site: string;
  currentUserId: string;
  enabled?: boolean;
};

export const useComments = ({ boardId, site, currentUserId, enabled = true }: UseCommentsParams) => {
  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    client: commentServiceClient,
    variables: { boardId, site },
    fetchPolicy: 'cache-and-network',
    skip: !enabled,
  });

  // const [addCommentMutation, { loading: addingComment }] = useMutation(ADD_COMMENT, {
  //   client: commentServiceClient,
  // });

  // const [addReplyMutation, { loading: addingReply }] = useMutation(ADD_REPLY, {
  //   client: commentServiceClient,
  // });

  const comments = useMemo(() => data?.comments?.comments ?? [], [data]);
  return {
    comments,
    loading,
    error,
    refetch,
  };
};


