import { AuthStatus } from '../../types/auth-status';
import { parseAuthorizeResult } from '../parse-authorize-result';

describe('parseAuthorizeResult', () => {
  it('maps a valid bridge payload', () => {
    expect(
      parseAuthorizeResult({ status: 'authorized', musicUserToken: '  token  ' }),
    ).toEqual({ status: AuthStatus.AUTHORIZED, musicUserToken: 'token' });
  });

  it('returns unknown when status is missing or undefined', () => {
    expect(parseAuthorizeResult({ status: undefined })).toEqual({ status: AuthStatus.UNKNOWN });
    expect(parseAuthorizeResult(undefined)).toEqual({ status: AuthStatus.UNKNOWN });
  });

  it('does not treat the string "undefined" as a valid status', () => {
    expect(parseAuthorizeResult({ status: 'undefined' })).toEqual({ status: AuthStatus.UNKNOWN });
    expect(parseAuthorizeResult(undefined)).toEqual({ status: AuthStatus.UNKNOWN });
  });
});
