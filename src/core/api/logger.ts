import { appConfig } from '@/src/core/config/appConfig';

function safeJson(value: unknown): string {
  try {
    const s = JSON.stringify(value);
    if (s.length > 1200) return `${s.slice(0, 1200)}…`;
    return s;
  } catch {
    return '[unserializable]';
  }
}

export function logApiResponse(params: {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  bodyPreview?: unknown;
}) {
  if (!appConfig.enableApiLogs) return;
  // console.* is intentional: you asked for logs you can inspect while testing.

}

export function logApiError(params: { method: string; url: string; error: string; durationMs: number }) {
  if (!appConfig.enableApiLogs) return;
  console.warn(`[api] ${params.method} ${params.url} -> error (${Math.round(params.durationMs)}ms) ${params.error}`);
}

