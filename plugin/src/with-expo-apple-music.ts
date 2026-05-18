import { type ConfigPlugin, withInfoPlist } from '@expo/config-plugins';

export const DEFAULT_MUSIC_USAGE = 'Allow $(PRODUCT_NAME) to access Apple Music.';

export type ExpoAppleMusicPluginProps = {
  /**
   * Sets `NSAppleMusicUsageDescription` in the generated iOS Info.plist.
   */
  musicUsageDescription?: string;
};

const withExpoAppleMusic: ConfigPlugin<ExpoAppleMusicPluginProps | void> = (config, props) => {
  const { musicUsageDescription } = props ?? {};

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
