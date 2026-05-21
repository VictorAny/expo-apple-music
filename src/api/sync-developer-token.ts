import { Platform } from 'react-native';

import { AppleMusicErrorCode } from '../constants/apple-music-error-codes';
import { MusicModule } from '../native-module';
import { configureMusicKit } from '../web/MusicKitLoader';

export function requireDeveloperTokenString(
  developerToken: string | undefined,
  operation: string,
): string {
  const trimmed = developerToken?.trim();
  if (!trimmed) {
    throw {
      code: AppleMusicErrorCode.missingDeveloperToken,
      message: `Apple Music developer JWT is required for ${operation}.`,
    };
  }
  return trimmed;
}

/** Pushes the developer JWT to native storage (iOS/Android) or MusicKit JS (web). Does not run user auth. */
export async function syncDeveloperTokenToPlatform(developerToken: string): Promise<void> {
  const trimmed = developerToken.trim();
  if (!trimmed) {
    return;
  }
  if (Platform.OS === 'web') {
    await configureMusicKit(trimmed);
    return;
  }
  await MusicModule.setDeveloperToken(trimmed);
}
