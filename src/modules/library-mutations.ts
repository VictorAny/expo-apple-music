import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import { requireMusicUserToken } from '../api/require-music-user-token';
import type { CreatePlaylistOptions, PlaylistTrackRef, ResourceIds } from '../types/library-mutations';
import type { Playlist } from '../types/playlist';
import { MusicModule } from '../native-module';
import { normalizeResourceIds } from '../utils/normalize-resource-ids';

class LibraryMutations {
  public static async addToLibrary(musicUserToken: string, resourceIds: ResourceIds): Promise<void> {
    requireMusicUserToken(musicUserToken, 'LibraryMutations.addToLibrary');
    await callNative('LibraryMutations.addToLibrary', async () => {
      await MusicModule.addToLibrary(musicUserToken, normalizeResourceIds(resourceIds));
    });
  }

  public static async createPlaylist(
    musicUserToken: string,
    options: CreatePlaylistOptions,
  ): Promise<Playlist> {
    requireMusicUserToken(musicUserToken, 'LibraryMutations.createPlaylist');
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
      return (await MusicModule.createLibraryPlaylist(musicUserToken, payload)) as Playlist;
    });
  }

  public static async addTracksToPlaylist(
    musicUserToken: string,
    playlistId: string,
    tracks: PlaylistTrackRef[],
  ): Promise<void> {
    requireMusicUserToken(musicUserToken, 'LibraryMutations.addTracksToPlaylist');
    assertLibraryId(playlistId, 'playlistId');
    await callNative('LibraryMutations.addTracksToPlaylist', async () => {
      await MusicModule.addTracksToLibraryPlaylist(
        musicUserToken,
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
