export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthUser = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
};

export type AuthStatus = 'checking' | 'unauthenticated' | 'authenticated' | 'loading';

