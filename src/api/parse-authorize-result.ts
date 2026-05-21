import type { AuthStatus } from '../types/auth-status';
import type { AuthorizeResult } from '../types/authorize-result';

export function parseAuthorizeResult(raw: unknown): AuthorizeResult {
  if (raw && typeof raw === 'object' && 'status' in raw) {
    const record = raw as { status: string; musicUserToken?: string | null };
    const musicUserToken = record.musicUserToken?.trim();
    return {
      status: record.status as AuthStatus,
      ...(musicUserToken ? { musicUserToken } : {}),
    };
  }
  return { status: String(raw) as AuthStatus };
}
