// Board Service에는 getUser 필드가 없으므로 임시로 주석 처리
// const GET_USER = gql`
//   query GetUser($userId: String) {
//     getUser(userId: $userId) {
//       Id
//       authOrganization
//       createTime
//       nickname
//       profileImage
//       userId
//     }
//   }
// `;

// const GET_ME = gql`
//   query GetMe {
//     getUser {
//       Id
//       authOrganization
//       createTime
//       nickname
//       profileImage
//       userId
//     }
//   }
// `;

export const useUser = (userId?: string) => ({
  // Board Service에는 getUser 필드가 없으므로 임시로 mock 데이터 반환
  // const { data, loading, error } = useQuery<Query, QueryGetUserArgs>(
  //   userId ? GET_USER : GET_ME, // 🔹 userId가 없으면 GetMe 호출
  //   {
  //     variables: userId ? { userId } : undefined,
  //     fetchPolicy: 'cache-first',
  //   }
  // );

  user: null, // 임시로 null 반환
  loading: false,
  error: null,
});
