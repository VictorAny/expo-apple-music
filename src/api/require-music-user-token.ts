import { AppleMusicErrorCode } from '../constants/apple-music-error-codes';
import { asThrownAppleMusicError } from '../utils/apple-music-error';

export function requireMusicUserToken(
  musicUserToken: string | null | undefined,
  operation: string,
): string {
  const trimmed = musicUserToken?.trim();
  if (!trimmed) {
    throw asThrownAppleMusicError({
      code: AppleMusicErrorCode.missingMusicUserToken,
      message: `Apple Music music user token is required for ${operation}. Pass the token from Auth.authorize() (store it in your app).`,
      operation,
    });
  }
  return trimmed;
}
