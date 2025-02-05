import type { Query, UserType, QueryGetUserArgs } from 'src/__generated__/graphql';

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

// export const useUser = (userId: QueryGetUserArgs['userId']) => {
export const useUser = () => {
  const { data, loading, error } = useQuery<Query, QueryGetUserArgs>(GET_USER, {
    // variables: { userId },
    // skip: !userId,
    fetchPolicy: 'cache-first',
  });

  return {
    user: data?.getUser as UserType | null, // 올바른 타입 지정
    loading,
    error,
  };
};
