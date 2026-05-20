import { parseStorefrontId } from '../web/music-kit-api';
import * as errors from '../web/apple-music-errors';
import type { AppleMusicRestTransport } from './apple-music-rest-transport';

export type StorefrontResolver = () => Promise<string | null | undefined>;

/** Resolves and caches the user's Apple Music storefront id for catalog paths. */
export class StorefrontRestClient {
  private cachedStorefront: string | null = null;

  constructor(
    private readonly transport: AppleMusicRestTransport,
    private readonly resolveFromMusicKit?: StorefrontResolver,
  ) {}

  async getStorefront(): Promise<string> {
    if (this.cachedStorefront) {
      return this.cachedStorefront;
    }

    const fromMusicKit = this.resolveFromMusicKit ? await this.resolveFromMusicKit() : null;
    if (fromMusicKit) {
      this.cachedStorefront = fromMusicKit;
      return fromMusicKit;
    }

    const json = await this.transport.getJson('/v1/me/storefront');
    const id = parseStorefrontId(json);
    if (!id) {
      throw errors.apiError('Storefront response missing id');
    }
    this.cachedStorefront = id;
    return id;
  }
}
