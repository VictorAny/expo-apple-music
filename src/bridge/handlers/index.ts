import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import type { WebPlaybackController } from '../../web/WebPlaybackController';
import type { WebQueueService } from '../../web/WebQueueService';
import type { WebSubscriptionService } from '../../web/WebSubscriptionService';
import { createAuthBridge } from './auth-bridge';
import { createCatalogBridge } from './catalog-bridge';
import { createHistoryBridge } from './history-bridge';
import { createLibraryBridge } from './library-bridge';
import { createLibraryMutationsBridge } from './library-mutations-bridge';
import { createPlayerBridge } from './player-bridge';
import { createRatingsBridge } from './ratings-bridge';
import { createRecommendationsBridge } from './recommendations-bridge';

export type WebBridgeHandlers = ReturnType<typeof createWebBridgeHandlers>;

export function createWebBridgeHandlers(deps: {
  api: WebAppleMusicApiClient;
  subscription: WebSubscriptionService;
  queue: WebQueueService;
  playback: WebPlaybackController;
}) {
  return {
    ...createAuthBridge(deps.api, deps.subscription),
    ...createCatalogBridge(deps.api),
    ...createLibraryBridge(deps.api),
    ...createHistoryBridge(deps.api),
    ...createPlayerBridge(deps.api, deps.queue, deps.playback),
    ...createRatingsBridge(deps.api),
    ...createLibraryMutationsBridge(deps.api),
    ...createRecommendationsBridge(deps.api),
  };
}
