import { NativeModule, registerWebModule } from 'expo-modules-core';

import { createWebBridgeHandlers } from './bridge/handlers';
import { WebAppleMusicApiClient } from './web/WebAppleMusicApiClient';
import { WebPlaybackController } from './web/WebPlaybackController';
import { WebPlaybackObserver } from './web/WebPlaybackObserver';
import { WebQueueService } from './web/WebQueueService';
import { WebSubscriptionService } from './web/WebSubscriptionService';

export class ExpoAppleMusicModule extends NativeModule {
  __expo_module_name__ = 'ExpoAppleMusic';

  private readonly api = new WebAppleMusicApiClient();
  private readonly subscription = new WebSubscriptionService(this.api);
  private readonly queue = new WebQueueService(this.api);
  private readonly playback = new WebPlaybackController();
  private readonly playbackObserver = new WebPlaybackObserver();

  constructor() {
    super();
    Object.assign(
      this,
      createWebBridgeHandlers({
        api: this.api,
        subscription: this.subscription,
        queue: this.queue,
        playback: this.playback,
      }),
    );
  }

  startObserving(): void {
    this.playbackObserver.start(this);
  }

  stopObserving(): void {
    this.playbackObserver.stop();
  }
}

const moduleInstance = registerWebModule(
  ExpoAppleMusicModule,
  'ExpoAppleMusic',
) as unknown as ExpoAppleMusicModule;

export default moduleInstance;
