import { decodeJwtExpSeconds, isJwtExpired } from '../decode-jwt-exp';

function jwtWithExp(exp: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: 'TEST' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: 'TEAM', iat: 1, exp })).toString('base64url');
  return `${header}.${payload}.signature`;
}

describe('decodeJwtExpSeconds', () => {
  it('reads exp from payload', () => {
    expect(decodeJwtExpSeconds(jwtWithExp(1_700_000_000))).toBe(1_700_000_000);
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtExpSeconds('not-a-jwt')).toBeNull();
  });
});

describe('isJwtExpired', () => {
  it('returns true when exp is within buffer', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwtWithExp(now + 60);
    expect(isJwtExpired(token, 300)).toBe(true);
  });

  it('returns false when exp is far in the future', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwtWithExp(now + 86_400);
    expect(isJwtExpired(token, 300)).toBe(false);
  });
});
