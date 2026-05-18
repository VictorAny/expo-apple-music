// Reexport the native module. On web, it will be resolved to ExpoAppleMusicModule.web.ts
// and on native platforms to ExpoAppleMusicModule.ts
export { default } from './ExpoAppleMusicModule';
export { default as ExpoAppleMusicView } from './ExpoAppleMusicView';
export * from  './ExpoAppleMusic.types';
