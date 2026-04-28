import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { ApiResult } from '@/src/core/api/types';
import { AUTH_KEYS } from '@/src/features/auth/authKeys';
import { loginRequest, registerRequest } from '@/src/features/auth/services/authService';
import type { AuthStatus, AuthTokens, AuthUser } from '@/src/features/auth/types';
import { storageDelete, storageGet, storageSet } from '@/src/core/storage/appStorage';
import { secureDelete, secureGet, secureSet } from '@/src/core/storage/secureStore';

function avatarKey(userId: string) {
  return `${AUTH_KEYS.avatarByUserIdPrefix}${userId}`;
}

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  authHeader: Record<string, string>;
  login: (params: { email: string; password: string }) => Promise<ApiResult<true>>;
  register: (params: { username: string; email: string; password: string }) => Promise<ApiResult<true>>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
  onUnauthorized: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const hasValidUser = useCallback((u: AuthUser | null) => {
    const id = u?.id ? String(u.id) : '';
    return Boolean(id) && id !== '0' && id !== 'null' && id !== 'undefined';
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const accessToken = await secureGet(AUTH_KEYS.accessToken);
      const refreshToken = await secureGet(AUTH_KEYS.refreshToken);
      const savedUser = await storageGet<AuthUser>(AUTH_KEYS.user);
      if (!mounted) return;

      if (accessToken && hasValidUser(savedUser)) {
        const savedAvatar = savedUser?.id ? await storageGet<string>(avatarKey(savedUser.id)) : null;
        setTokens({ accessToken, refreshToken: refreshToken ?? undefined });
        setUser(savedUser ? { ...savedUser, avatarUrl: savedAvatar ?? savedUser.avatarUrl } : savedUser);
        setStatus('authenticated');
      } else {
        setTokens(null);
        setUser(null);
        setStatus('unauthenticated');
      }
    })().catch(() => {
      if (!mounted) return;
      setStatus('unauthenticated');
    });
    return () => {
      mounted = false;
    };
  }, [hasValidUser]);

  const logout = useCallback(async () => {
    setStatus('loading');
    setTokens(null);
    setUser(null);
    await Promise.all([
      secureDelete(AUTH_KEYS.accessToken),
      secureDelete(AUTH_KEYS.refreshToken),
      storageDelete(AUTH_KEYS.user),
    ]);
    setStatus('unauthenticated');
  }, []);

  const updateUser = useCallback(async (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      const next: AuthUser = { ...(prev ?? { id: '0' }), ...patch };
      storageSet(AUTH_KEYS.user, next).catch(() => {
        // ignore
      });
      if (next.id && typeof patch.avatarUrl === 'string') {
        storageSet(avatarKey(next.id), patch.avatarUrl).catch(() => {
          // ignore
        });
      }
      return next;
    });
  }, []);

  const onUnauthorized = useCallback(async () => {
    // basic refresh handling placeholder: for now, treat 401 as forced logout.
    await logout();
  }, [logout]);

  const login = useCallback(
    async (params: { email: string; password: string }): Promise<ApiResult<true>> => {
      setStatus('loading');
      const res = await loginRequest(params);
      if (!res.ok) {
        setStatus('unauthenticated');
        return { ok: false, status: res.status, error: res.error, headers: res.headers, details: res.details };
      }

      setTokens(res.data.tokens);
      const savedAvatar = res.data.user.id ? await storageGet<string>(avatarKey(res.data.user.id)) : null;
      const nextUser = { ...res.data.user, avatarUrl: savedAvatar ?? res.data.user.avatarUrl };
      setUser(nextUser);
      await Promise.all([
        secureSet(AUTH_KEYS.accessToken, res.data.tokens.accessToken),
        res.data.tokens.refreshToken ? secureSet(AUTH_KEYS.refreshToken, res.data.tokens.refreshToken) : Promise.resolve(),
        storageSet(AUTH_KEYS.user, nextUser),
      ]);

      setStatus('authenticated');
      return { ok: true, status: 200, headers: {}, data: true };
    },
    [],
  );

  const register = useCallback(
    async (params: { username: string; email: string; password: string }): Promise<ApiResult<true>> => {
      setStatus('loading');
      const res = await registerRequest(params);
      if (!res.ok) {
        setStatus('unauthenticated');
        return { ok: false, status: res.status, error: res.error, headers: res.headers, details: res.details };
      }

      setTokens(res.data.tokens);
      const savedAvatar = res.data.user.id ? await storageGet<string>(avatarKey(res.data.user.id)) : null;
      const nextUser = { ...res.data.user, avatarUrl: savedAvatar ?? res.data.user.avatarUrl };
      setUser(nextUser);
      await Promise.all([
        secureSet(AUTH_KEYS.accessToken, res.data.tokens.accessToken),
        res.data.tokens.refreshToken ? secureSet(AUTH_KEYS.refreshToken, res.data.tokens.refreshToken) : Promise.resolve(),
        storageSet(AUTH_KEYS.user, nextUser),
      ]);

      setStatus('authenticated');
      return { ok: true, status: 200, headers: {}, data: true };
    },
    [],
  );

  const authHeader = useMemo(() => {
    const token = tokens?.accessToken;
    return (token ? { Authorization: `Bearer ${token}` } : {}) as Record<string, string>;
  }, [tokens?.accessToken]);

  const value: AuthContextValue = useMemo(
    () => ({ status, user, tokens, authHeader, login, register, updateUser, logout, onUnauthorized }),
    [status, user, tokens, authHeader, login, register, updateUser, logout, onUnauthorized],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

