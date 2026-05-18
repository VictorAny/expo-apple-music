import {
  AndroidConfig,
  type ConfigPlugin,
  withInfoPlist,
  withAndroidManifest,
} from '@expo/config-plugins';

export const DEFAULT_MUSIC_USAGE = 'Allow $(PRODUCT_NAME) to access Apple Music.';

const ANDROID_DEVELOPER_TOKEN_META = 'expo.modules.applemusic.DEVELOPER_TOKEN';
const APPLE_MUSIC_PACKAGE = 'com.apple.android.music';

type ManifestQuery = {
  intent?: Array<{
    action?: Array<{ $: { 'android:name': string } }>;
    category?: Array<{ $: { 'android:name': string } }>;
    data?: Array<{ $: { 'android:scheme'?: string; 'android:host'?: string } }>;
  }>;
  package?: Array<{ $: { 'android:name': string } }>;
};

/** Android 11+ package visibility — required for MusicKit auth SDK install detection. */
function ensureAppleMusicQueries(
  manifest: AndroidConfig.Manifest.AndroidManifest,
): void {
  if (!manifest.manifest.queries?.length) {
    manifest.manifest.queries = [{}];
  }

  const query = manifest.manifest.queries[0] as ManifestQuery;

  query.package ??= [];
  if (!query.package.some((p) => p.$['android:name'] === APPLE_MUSIC_PACKAGE)) {
    query.package.push({ $: { 'android:name': APPLE_MUSIC_PACKAGE } });
  }

  query.intent ??= [];
  const hasMusicSdkIntent = query.intent.some((intent) =>
    intent.data?.some(
      (d) => d.$['android:scheme'] === 'musicsdk' && d.$['android:host'] === 'applemusic',
    ),
  );
  if (!hasMusicSdkIntent) {
    query.intent.push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      data: [{ $: { 'android:scheme': 'musicsdk', 'android:host': 'applemusic' } }],
    });
  }

  const hasAppleMusicSchemeIntent = query.intent.some((intent) =>
    intent.data?.some((d) => d.$['android:scheme'] === 'com.apple.android.music'),
  );
  if (!hasAppleMusicSchemeIntent) {
    query.intent.push({
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      data: [{ $: { 'android:scheme': 'com.apple.android.music' } }],
    });
  }
}

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
    ensureAppleMusicQueries(c.modResults);

    const token = androidDeveloperToken?.trim();
    if (token) {
      const application = AndroidConfig.Manifest.getMainApplicationOrThrow(c.modResults);
      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        application,
        ANDROID_DEVELOPER_TOKEN_META,
        token,
      );
    }

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
