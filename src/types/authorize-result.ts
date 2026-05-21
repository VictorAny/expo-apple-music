import type { AuthStatus } from './auth-status';

/** Result of {@link Auth.authorize} — app stores `musicUserToken` (e.g. Zustand). */
export type AuthorizeResult = {
  status: AuthStatus;
  /** Present when `status` is `authorized`. Not persisted by the native module. */
  musicUserToken?: string;
};
