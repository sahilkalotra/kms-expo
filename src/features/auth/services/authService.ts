import { apiClient } from '@/src/core/api/singleton';
import type { ApiResult } from '@/src/core/api/types';
import type { AuthTokens, AuthUser } from '@/src/features/auth/types';

type LoginBody = { email: string; password: string };
type RegisterBody = { username: string; email: string; password: string };

function normalizeAvatarUrl(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    if (typeof input.url === 'string') return input.url;
    if (typeof input.uri === 'string') return input.uri;
  }
  return undefined;
}

function pickUser(payload: any): AuthUser {
  const u = payload?.user ?? payload?.data?.user ?? payload?.data ?? payload ?? {};
  return {
    id: String(u.id ?? u._id ?? '0'),
    username: u.username ?? undefined,
    email: u.email ?? undefined,
    avatarUrl: normalizeAvatarUrl(u.avatarUrl ?? u.avatar ?? u.profileImage),
  };
}

function pickTokens(payload: any): AuthTokens | null {
  const p = payload?.tokens ?? payload?.data?.tokens ?? payload?.data ?? payload ?? {};
  const accessToken = p.accessToken ?? p.token ?? p.access ?? null;
  const refreshToken = p.refreshToken ?? p.refresh ?? undefined;
  if (!accessToken) return null;
  return { accessToken: String(accessToken), refreshToken: refreshToken ? String(refreshToken) : undefined };
}

export async function loginRequest(body: LoginBody): Promise<ApiResult<{ user: AuthUser; tokens: AuthTokens }>> {
  const res = await apiClient.request<any>({
    path: '/api/v1/users/login',
    method: 'POST',
    body,
    retry: { retries: 0, initialDelayMs: 0 },
  });
  if (!res.ok) return res as any;

  const tokens = pickTokens(res.data);
  if (!tokens) return { ok: false, status: 200, error: 'Missing token in response', headers: res.headers, details: res.data };

  return { ok: true, status: res.status, headers: res.headers, data: { user: pickUser(res.data), tokens } };
}

export async function registerRequest(body: RegisterBody): Promise<ApiResult<{ user: AuthUser; tokens: AuthTokens }>> {
  const res = await apiClient.request<any>({
    path: '/api/v1/users/register',
    method: 'POST',
    body,
    retry: { retries: 0, initialDelayMs: 0 },
  });
  if (!res.ok) return res as any;

  // FreeAPI's register endpoint can succeed without returning tokens.
  // In that case, do a best-effort login immediately.
  const tokens = pickTokens(res.data);
  if (tokens) {
    return { ok: true, status: res.status, headers: res.headers, data: { user: pickUser(res.data), tokens } };
  }

  const loginRes = await loginRequest({ email: body.email, password: body.password });
  if (loginRes.ok) return loginRes;

  return {
    ok: false,
    status: res.status,
    error: 'Account created. Please sign in (and verify email if required).',
    code: 'REGISTERED_NO_TOKEN',
    headers: res.headers,
    details: res.data,
  };
}

