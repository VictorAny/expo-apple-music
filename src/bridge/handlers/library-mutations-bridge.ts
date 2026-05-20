import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';

export function createLibraryMutationsBridge(api: WebAppleMusicApiClient) {
  return {
    addToLibrary: async (resourceIds: Record<string, string[]>) => {
      await api.addToLibrary(resourceIds);
    },

    async createLibraryPlaylist(options: Record<string, unknown>) {
      const name = String(options.name ?? '');
      const description = options.description != null ? String(options.description) : null;
      const isPublic = Boolean(options.isPublic ?? false);
      const tracks = Array.isArray(options.tracks)
        ? (options.tracks as { id: string; type: string }[])
        : null;
      return api.createLibraryPlaylist(name, description, isPublic, tracks);
    },

    addTracksToLibraryPlaylist: async (
      playlistId: string,
      tracks: { id: string; type: string }[],
    ) => {
      await api.addTracksToLibraryPlaylist(playlistId, tracks);
    },
  };
}
