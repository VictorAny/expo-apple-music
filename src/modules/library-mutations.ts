import type { CreatePlaylistOptions, PlaylistTrackRef, ResourceIds } from '../types/library-mutations';
import type { Playlist } from '../types/playlist';
import { MusicModule } from '../native-module';
import { normalizeResourceIds } from '../utils/normalize-resource-ids';

class LibraryMutations {
  public static async addToLibrary(resourceIds: ResourceIds): Promise<void> {
    await MusicModule.addToLibrary(normalizeResourceIds(resourceIds));
  }

  public static async createPlaylist(options: CreatePlaylistOptions): Promise<Playlist> {
    const payload: Record<string, unknown> = {
      name: options.name,
      isPublic: options.isPublic ?? false,
    };
    if (options.description) {
      payload.description = options.description;
    }
    if (options.tracks?.length) {
      payload.tracks = options.tracks.map(trackRefToNative);
    }
    return (await MusicModule.createLibraryPlaylist(payload)) as Playlist;
  }

  public static async addTracksToPlaylist(
    playlistId: string,
    tracks: PlaylistTrackRef[],
  ): Promise<void> {
    await MusicModule.addTracksToLibraryPlaylist(
      playlistId,
      tracks.map(trackRefToNative),
    );
  }
}

function trackRefToNative(track: PlaylistTrackRef): { id: string; type: string } {
  return { id: track.id, type: track.type };
}

export default LibraryMutations;
