import {
  AndroidConfig,
  type ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from '@expo/config-plugins';

export const DEFAULT_MUSIC_USAGE = 'Allow $(PRODUCT_NAME) to access Apple Music.';

const ANDROID_DEVELOPER_TOKEN_META = 'expo.modules.applemusic.DEVELOPER_TOKEN';

export type ExpoAppleMusicPluginProps = {
  /**
   * Sets `NSAppleMusicUsageDescription` in the generated iOS Info.plist.
   */
  musicUsageDescription?: string;
  /**
   * MusicKit developer JWT for Android auth (dev/example only — prefer fetching from your backend in production).
   */
  androidDeveloperToken?: string;
};

const withExpoAppleMusic: ConfigPlugin<ExpoAppleMusicPluginProps | void> = (config, props) => {
  const { musicUsageDescription, androidDeveloperToken } = props ?? {};

  config = withAndroidManifest(config, (c) => {
    const token = androidDeveloperToken?.trim();
    if (!token) {
      return c;
    }

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(c.modResults);
    AndroidConfig.Manifest.addMetaDataItemToApplication(
      application,
      ANDROID_DEVELOPER_TOKEN_META,
      token,
    );
    return c;
  });

  return withInfoPlist(config, (c) => {
    const current = c.modResults.NSAppleMusicUsageDescription;
    const hasCurrent = typeof current === 'string' && current.trim().length > 0;
    const hasOption =
      typeof musicUsageDescription === 'string' && musicUsageDescription.trim().length > 0;

    if (hasOption) {
      c.modResults.NSAppleMusicUsageDescription = musicUsageDescription;
    } else if (!hasCurrent) {
      c.modResults.NSAppleMusicUsageDescription = DEFAULT_MUSIC_USAGE;
    }

    return c;
  });
};

export default withExpoAppleMusic;
