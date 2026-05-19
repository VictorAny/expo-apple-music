import * as errors from './apple-music-errors';
import { WebAppleMusicApiClient } from './WebAppleMusicApiClient';
import { getMusic } from './MusicKitLoader';

type MediaType = 'song' | 'album' | 'playlist' | 'station';

function parseMediaType(type: string): MediaType {
  switch (type) {
    case 'song':
    case 'album':
    case 'playlist':
    case 'station':
      return type;
    default:
      throw errors.unknownMediaType(type);
  }
}

export class WebQueueService {
  constructor(private readonly api = new WebAppleMusicApiClient()) {}

  async setQueue(itemId: string, type: string): Promise<void> {
    const mediaType = parseMediaType(type);
    if (WebAppleMusicApiClient.isLibraryId(itemId)) {
      await this.setLibraryQueue(itemId, mediaType);
    } else {
      await this.setCatalogQueue(itemId, mediaType);
    }
  }

  private async setCatalogQueue(itemId: string, type: MediaType): Promise<void> {
    const music = await getMusic();
    if (type === 'station') {
      await music.setQueue({ station: itemId });
      return;
    }
    await music.setQueue({ [type]: itemId });
  }

  private async setLibraryQueue(itemId: string, type: MediaType): Promise<void> {
    if (type === 'station') {
      throw errors.unsupportedLibraryType('station');
    }
    const catalogId = await this.api.resolveCatalogPlaybackId(itemId, type);
    await this.setCatalogQueue(catalogId, type);
  }

  async playLibrarySong(songId: string): Promise<void> {
    const catalogId = await this.api.resolveCatalogPlaybackId(songId, 'song');
    const music = await getMusic();
    await music.setQueue({ songs: [catalogId] });
  }

  async playLibraryPlaylist(playlistId: string, startingAt: number): Promise<void> {
    const catalogIds = await this.api.resolveLibrarySongCatalogIds(playlistId);
    if (catalogIds.length === 0) {
      throw errors.noSongsInPlaylist();
    }
    const startIndex =
      startingAt === -1 ? 0 : startingAt >= 0 && startingAt < catalogIds.length ? startingAt : 0;
    const music = await getMusic();
    await music.setQueue({ songs: catalogIds, startWith: startIndex });
  }
}
