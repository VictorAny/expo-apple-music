export const AuthStatus = {
  AUTHORIZED: 'authorized',
  DENIED: 'denied',
  NOT_DETERMINED: 'notDetermined',
  RESTRICTED: 'restricted',
  UNKNOWN: 'unknown',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];
