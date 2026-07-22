export type UserRole = 'user' | 'admin';

export type UserType = {
  Id: string;
  userId: string;
  nickname?: string | null;
  displayName?: string | null;
  authProvider: string;
  profileImage?: string | null;
  createTime: string;
  role: UserRole;
} | null;

export type UserTypeWithoutNull = NonNullable<UserType>;

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
