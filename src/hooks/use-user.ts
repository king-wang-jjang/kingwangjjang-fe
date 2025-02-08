import type { Query, QueryGetUserArgs } from 'src/__generated__/graphql';

import { gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($userId: String) {
    getUser(userId: $userId) {
      Id
      authOrganization
      createTime
      nickname
      profileImage
      userId
    }
  }
`;

const GET_ME = gql`
  query GetMe {
    getUser {
      Id
      authOrganization
      createTime
      nickname
      profileImage
      userId
    }
  }
`;

export const useUser = (userId?: QueryGetUserArgs['userId']) => {
  const { data, loading, error } = useQuery<Query, QueryGetUserArgs>(
    userId ? GET_USER : GET_ME, // 🔹 userId가 없으면 GetMe 호출
    {
      variables: userId ? { userId } : undefined,
      fetchPolicy: 'cache-first',
    }
  );

  return {
    user: data?.getUser ?? null,
    loading,
    error,
  };
};
