import {
  type ConfigPlugin,
  IOSConfig,
  withInfoPlist,
  withXcodeProject,
} from "@expo/config-plugins";

/** MusicKit APIs used by this module require iOS 16+. */
const IOS_DEPLOYMENT_TARGET = "16.0";

const withIosDeploymentTargetPodfile =
  IOSConfig.BuildProperties.createBuildPodfilePropsConfigPlugin(
    [
      {
        propName: "ios.deploymentTarget",
        propValueGetter: () => IOS_DEPLOYMENT_TARGET,
      },
    ],
    "withExpoAppleMusicIosDeploymentTargetPodfile",
  );

const withIosDeploymentTargetXcodeProject: ConfigPlugin = (config) => {
  return withXcodeProject(config, (c) => {
    const { Target, XcodeUtils } = IOSConfig;
    const project = c.modResults;
    const targetBuildConfigListIds = Target.getNativeTargets(project)
      .filter(([_, target]) =>
        Target.isTargetOfType(target, Target.TargetType.APPLICATION),
      )
      .map(([_, target]) => target.buildConfigurationList);

    for (const buildConfigListId of targetBuildConfigListIds) {
      for (const [, configurations] of XcodeUtils.getBuildConfigurationsForListId(
        project,
        buildConfigListId,
      )) {
        const { buildSettings } = configurations;
        if (buildSettings?.IPHONEOS_DEPLOYMENT_TARGET) {
          buildSettings.IPHONEOS_DEPLOYMENT_TARGET = IOS_DEPLOYMENT_TARGET;
        }
      }
    }
    return c;
  });
};

export const DEFAULT_MUSIC_USAGE =
  "Allow $(PRODUCT_NAME) to access Apple Music.";

export type ExpoAppleMusicPluginProps = {
  /**
   * Sets `NSAppleMusicUsageDescription` in the generated iOS Info.plist.
   */
  musicUsageDescription?: string;
};

const withExpoAppleMusic: ConfigPlugin<ExpoAppleMusicPluginProps | void> = (
  config,
  props,
) => {
  const { musicUsageDescription } = props ?? {};

  config = withIosDeploymentTargetPodfile(config);
  config = withIosDeploymentTargetXcodeProject(config);

  return withInfoPlist(config, (c) => {
    const current = c.modResults.NSAppleMusicUsageDescription;
    const hasCurrent = typeof current === "string" && current.trim().length > 0;
    const hasOption =
      typeof musicUsageDescription === "string" &&
      musicUsageDescription.trim().length > 0;

    if (hasOption) {
      c.modResults.NSAppleMusicUsageDescription = musicUsageDescription;
    } else if (!hasCurrent) {
      c.modResults.NSAppleMusicUsageDescription = DEFAULT_MUSIC_USAGE;
    }

    return c;
  });
};

export default withExpoAppleMusic;
