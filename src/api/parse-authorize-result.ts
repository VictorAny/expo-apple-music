import { AuthStatus } from '../types/auth-status';
import type { AuthorizeResult } from '../types/authorize-result';

const AUTH_STATUS_VALUES = new Set<string>(Object.values(AuthStatus));

function normalizeStatus(value: unknown): AuthStatus {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (AUTH_STATUS_VALUES.has(trimmed)) {
      return trimmed as AuthStatus;
    }
  }
  return AuthStatus.UNKNOWN;
}

export function parseAuthorizeResult(raw: unknown): AuthorizeResult {
  if (raw == null) {
    return { status: AuthStatus.UNKNOWN };
  }
  if (typeof raw === 'object' && 'status' in raw) {
    const record = raw as { status?: unknown; musicUserToken?: string | null };
    const musicUserToken = record.musicUserToken?.trim();
    const status = normalizeStatus(record.status);
    return {
      status,
      ...(musicUserToken ? { musicUserToken } : {}),
    };
  }
  return { status: normalizeStatus(raw) };
}
