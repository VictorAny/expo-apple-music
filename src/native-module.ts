import { LegacyEventEmitter, requireNativeModule } from 'expo-modules-core';

export const UNSUPPORTED_PLATFORM = 'UNSUPPORTED_PLATFORM';

export const MusicModule = requireNativeModule('ExpoAppleMusic');

export const musicEventEmitter = new LegacyEventEmitter(MusicModule);
