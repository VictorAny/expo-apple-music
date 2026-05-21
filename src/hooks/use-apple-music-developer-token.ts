import { useEffect, useRef } from 'react';

import {
  hasDeveloperTokenProvider,
  refreshDeveloperToken,
} from '../api/developer-token';

export type UseAppleMusicDeveloperTokenOptions = {
  /** When true (default), refresh on mount if `configureAppleMusic` was called. */
  refreshOnMount?: boolean;
};

/**
 * Optional hook: sync developer JWT from your provider on startup (and when `enabled` flips on).
 * Pair with `configureAppleMusic({ getDeveloperToken })` in app root.
 */
export function useAppleMusicDeveloperToken(options?: UseAppleMusicDeveloperTokenOptions): void {
  const refreshOnMount = options?.refreshOnMount !== false;
  const ran = useRef(false);

  useEffect(() => {
    if (!refreshOnMount || ran.current || !hasDeveloperTokenProvider()) {
      return;
    }
    ran.current = true;
    void refreshDeveloperToken().catch(() => {
      // App should surface errors from Auth.authorize or explicit refreshDeveloperToken().
    });
  }, [refreshOnMount]);
}
