export function toErrorMessage(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
    return (err as any).message;
  }
  return 'Something went wrong. Please try again.';
}

export function isNetworkErrorMessage(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('network') || m.includes('timeout') || m.includes('failed to fetch');
}

