export type UserType = {
  Id: string;
  userId: string;
  nickname: string;
  authProvider: string;
  profileImage?: string | null;
  createTime: string;
} | null;

export type AuthState = {
  user: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
