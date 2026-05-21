import type { ExpoAppleMusicPluginProps } from "./with-expo-apple-music";

export type { ExpoAppleMusicPluginProps } from "./with-expo-apple-music";

export { DEFAULT_MUSIC_USAGE } from "./with-expo-apple-music";

/** Typed `app.config` plugin entry (Expo SDK 56+). */
export default function expoAppleMusic(
  props?: ExpoAppleMusicPluginProps,
): ["@wwdrew/expo-apple-music", ExpoAppleMusicPluginProps | void] {
  return ["@wwdrew/expo-apple-music", props];
}
