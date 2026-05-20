import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import type { CreatePlaylistOptions, PlaylistTrackRef, ResourceIds } from '../types/library-mutations';
import type { Playlist } from '../types/playlist';
import { MusicModule } from '../native-module';
import { normalizeResourceIds } from '../utils/normalize-resource-ids';

class LibraryMutations {
  public static async addToLibrary(resourceIds: ResourceIds): Promise<void> {
    await callNative('LibraryMutations.addToLibrary', async () => {
      await MusicModule.addToLibrary(normalizeResourceIds(resourceIds));
    });
  }

  public static async createPlaylist(options: CreatePlaylistOptions): Promise<Playlist> {
    return callNative('LibraryMutations.createPlaylist', async () => {
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
    });
  }

  public static async addTracksToPlaylist(
    playlistId: string,
    tracks: PlaylistTrackRef[],
  ): Promise<void> {
    assertLibraryId(playlistId, 'playlistId');
    await callNative('LibraryMutations.addTracksToPlaylist', async () => {
      await MusicModule.addTracksToLibraryPlaylist(
        playlistId,
        tracks.map(trackRefToNative),
      );
    });
  }
}

function trackRefToNative(track: PlaylistTrackRef): { id: string; type: string } {
  return { id: track.id, type: track.type };
}

export default LibraryMutations;
