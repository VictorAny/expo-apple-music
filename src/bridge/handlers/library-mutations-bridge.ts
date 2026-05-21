import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';

export function createLibraryMutationsBridge(api: WebAppleMusicApiClient) {
  return {
    addToLibrary: async (musicUserToken: string, resourceIds: Record<string, string[]>) => {
      await api.addToLibrary(musicUserToken, resourceIds);
    },

    async createLibraryPlaylist(musicUserToken: string, options: Record<string, unknown>) {
      const name = String(options.name ?? '');
      const description = options.description != null ? String(options.description) : null;
      const isPublic = Boolean(options.isPublic ?? false);
      const tracks = Array.isArray(options.tracks)
        ? (options.tracks as { id: string; type: string }[])
        : null;
      return api.createLibraryPlaylist(musicUserToken, name, description, isPublic, tracks);
    },

    addTracksToLibraryPlaylist: async (
      musicUserToken: string,
      playlistId: string,
      tracks: { id: string; type: string }[],
    ) => {
      await api.addTracksToLibraryPlaylist(musicUserToken, playlistId, tracks);
    },
  };
}
