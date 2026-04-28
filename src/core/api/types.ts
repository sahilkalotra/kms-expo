export type ApiOk<T> = {
  ok: true;
  status: number;
  data: T;
  headers: Record<string, string>;
};

export type ApiErr = {
  ok: false;
  status: number;
  error: string;
  code?: string;
  headers: Record<string, string>;
  details?: unknown;
};

export type ApiResult<T> = ApiOk<T> | ApiErr;

export type ApiRequest = {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  timeoutMs?: number;
  retry?: {
    retries: number;
    initialDelayMs: number;
  };
};

