export interface User {
  Id: string;
  userId: string;
  nickname: string;
  authProvider: string;
  profileImage?: string;
  createTime: string;
}

export interface MeResponse {
  me: User;
}
