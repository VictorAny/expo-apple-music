import { CatalogRestClient } from './catalog-rest-client';
import { HistoryRestClient } from './history-rest-client';
import { LibraryMutationsRestClient } from './library-mutations-rest-client';
import { LibraryRestClient } from './library-rest-client';
import { RatingsRestClient } from './ratings-rest-client';
import { RecommendationsRestClient } from './recommendations-rest-client';
import { StorefrontRestClient } from './storefront-rest-client';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';
import type { StorefrontResolver } from './storefront-rest-client';

export type AppleMusicRestStack = {
  transport: AppleMusicRestTransport;
  storefront: StorefrontRestClient;
  catalog: CatalogRestClient;
  library: LibraryRestClient;
  history: HistoryRestClient;
  ratings: RatingsRestClient;
  libraryMutations: LibraryMutationsRestClient;
  recommendations: RecommendationsRestClient;
};

export function createAppleMusicRestStack(
  transport: AppleMusicRestTransport,
  storefrontResolver?: StorefrontResolver,
): AppleMusicRestStack {
  const storefront = new StorefrontRestClient(transport, storefrontResolver);
  return {
    transport,
    storefront,
    catalog: new CatalogRestClient(transport, storefront),
    library: new LibraryRestClient(transport),
    history: new HistoryRestClient(transport),
    ratings: new RatingsRestClient(transport),
    libraryMutations: new LibraryMutationsRestClient(transport),
    recommendations: new RecommendationsRestClient(transport),
  };
}
