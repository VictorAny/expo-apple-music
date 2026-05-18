import { registerWebModule, NativeModule } from 'expo';

import { ExpoAppleMusicModuleEvents } from './ExpoAppleMusic.types';

class ExpoAppleMusicModule extends NativeModule<ExpoAppleMusicModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoAppleMusicModule, 'ExpoAppleMusicModule');
