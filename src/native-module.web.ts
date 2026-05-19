import { LegacyEventEmitter } from 'expo-modules-core';

import ExpoAppleMusicModule, { type ExpoAppleMusicModule as ExpoAppleMusicModuleType } from './ExpoAppleMusicModule.web';

export const UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM';

/**
 * On web, `requireNativeModule` only resolves when `ExpoDomWebView` is set (see
 * expo-modules-core `requireNativeModule.web.ts`). Import the `registerWebModule`
 * singleton directly — same pattern as expo-font's `ExpoFontLoader.web.ts`.
 */
export const MusicModule: ExpoAppleMusicModuleType = ExpoAppleMusicModule;

export const musicEventEmitter = new LegacyEventEmitter(MusicModule);
