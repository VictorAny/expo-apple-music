import { configureAppleMusic as configure } from '../api/developer-token';
import type { AppleMusicConfigureOptions } from '../types/developer-token-provider';

/**
 * App-level configuration (developer JWT provider, etc.).
 *
 * @example
 * ```ts
 * import { AppleMusic, Auth } from '@wwdrew/expo-apple-music';
 *
 * AppleMusic.configure({
 *   getDeveloperToken: async () => {
 *     const res = await fetch('https://your.api/apple-music/developer-token');
 *     const { token } = await res.json();
 *     return token;
 *   },
 * });
 * ```
 */
export const AppleMusic = {
  configure: (options: AppleMusicConfigureOptions) => configure(options),
};
