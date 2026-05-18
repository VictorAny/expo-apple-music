import { NativeModule, requireNativeModule } from 'expo';

import { ExpoAppleMusicModuleEvents } from './ExpoAppleMusic.types';

declare class ExpoAppleMusicModule extends NativeModule<ExpoAppleMusicModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAppleMusicModule>('ExpoAppleMusic');
