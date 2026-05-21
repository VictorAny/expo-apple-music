const DEFAULT_REFRESH_BUFFER_SECONDS = 300;

/** Decode JWT `exp` (seconds since epoch). Returns null if missing or malformed. */
export function decodeJwtExpSeconds(token: string): number | null {
  const parts = token.trim().split('.');
  const encodedPayload = parts[1];
  if (parts.length < 2 || encodedPayload == null) {
    return null;
  }
  try {
    const payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof json.exp === 'number' && Number.isFinite(json.exp) ? json.exp : null;
  } catch {
    return null;
  }
}

/** True when `exp` is within `bufferSeconds` of now (or `exp` is missing). */
export function isJwtExpired(
  token: string,
  bufferSeconds: number = DEFAULT_REFRESH_BUFFER_SECONDS,
): boolean {
  const exp = decodeJwtExpSeconds(token);
  if (exp == null) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return exp <= now + bufferSeconds;
}
