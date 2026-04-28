import Constants from 'expo-constants';

export type AppConfig = {
  apiBaseUrl: string;
  apiTimeoutMs: number;
  enableApiLogs: boolean;
};

function readExtra(): any {
  const c: any = (Constants as any).expoConfig ?? (Constants as any).manifest2?.extra ?? (Constants as any).manifest?.extra;
  return c?.extra ?? c ?? {};
}

const extra = readExtra();

export const appConfig: AppConfig = {
  apiBaseUrl: String(extra.API_BASE_URL ?? 'https://api.freeapi.app/').trim(),
  apiTimeoutMs: Number(extra.API_TIMEOUT_MS ?? 15000),
  enableApiLogs: Boolean(extra.API_LOGS ?? true),
};

