import { appConfig } from '@/src/core/config/appConfig';
import type { ApiRequest, ApiResult } from '@/src/core/api/types';
import { logApiError, logApiResponse } from '@/src/core/api/logger';
import { toErrorMessage } from '@/src/core/api/errors';

function buildUrl(path: string, query?: ApiRequest['query']): string {
  const base = appConfig.apiBaseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${p}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function toHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(method: string, status: number): boolean {
  if (method !== 'GET') return false;
  if (status === 408) return true;
  if (status === 429) return true;
  return status >= 500 && status <= 599;
}

export class ApiClient {
  public async request<T>(req: ApiRequest): Promise<ApiResult<T>> {
    const url = buildUrl(req.path, req.query);
    const method = req.method;
    const started = Date.now();

    const retryCfg = req.retry ?? (method === 'GET' ? { retries: 2, initialDelayMs: 400 } : { retries: 0, initialDelayMs: 0 });
    let attempt = 0;

    while (true) {
      attempt += 1;
      const controller = new AbortController();
      const timeoutMs = req.timeoutMs ?? appConfig.apiTimeoutMs;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          method,
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(req.headers ?? {}),
          },
          body: req.body === undefined ? undefined : JSON.stringify(req.body),
        });

        const headers = toHeaders(res.headers);
        const durationMs = Date.now() - started;

        let parsed: any = null;
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          try {
            parsed = await res.json();
          } catch {
            parsed = null;
          }
        } else {
          try {
            parsed = await res.text();
          } catch {
            parsed = null;
          }
        }

        logApiResponse({ method, url, status: res.status, durationMs, bodyPreview: parsed });

        if (res.ok) {
          return { ok: true, status: res.status, data: parsed as T, headers };
        }

        const msg =
          typeof parsed === 'object' && parsed && 'message' in parsed && typeof (parsed as any).message === 'string'
            ? (parsed as any).message
            : `Request failed (${res.status})`;

        if (attempt <= retryCfg.retries && isRetryable(method, res.status)) {
          const backoff = retryCfg.initialDelayMs * Math.pow(2, attempt - 1);
          await sleep(backoff);
          continue;
        }

        return { ok: false, status: res.status, error: msg, headers, details: parsed };
      } catch (e) {
        const durationMs = Date.now() - started;
        const isAbort =
          e &&
          typeof e === 'object' &&
          'name' in e &&
          typeof (e as any).name === 'string' &&
          (e as any).name === 'AbortError';
        const msg = isAbort ? 'Request timed out' : toErrorMessage(e);
        logApiError({ method, url, error: msg, durationMs });

        if (attempt <= retryCfg.retries && method === 'GET') {
          const backoff = retryCfg.initialDelayMs * Math.pow(2, attempt - 1);
          await sleep(backoff);
          continue;
        }

        return { ok: false, status: 0, error: msg, headers: {} };
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }
}

