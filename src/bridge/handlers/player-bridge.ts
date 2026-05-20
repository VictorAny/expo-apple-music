import type { WebAppleMusicApiClient } from '../../web/WebAppleMusicApiClient';
import type { WebPlaybackController } from '../../web/WebPlaybackController';
import type { WebQueueService } from '../../web/WebQueueService';

export function createPlayerBridge(
  api: WebAppleMusicApiClient,
  queue: WebQueueService,
  playback: WebPlaybackController,
) {
  return {
    async setPlaybackQueue(itemId: string, type: string): Promise<string> {
      await queue.setQueue(itemId, type);
      return 'Track(s) added to queue';
    },

    async playLibrarySong(songId: string): Promise<string> {
      await queue.playLibrarySong(songId);
      return 'Library song added to queue';
    },

    async playLibraryPlaylist(playlistId: string, startingAt: number): Promise<string> {
      await queue.playLibraryPlaylist(playlistId, startingAt);
      return 'Library playlist added to queue';
    },

    configurePlayer(mixWithOthers: boolean) {
      return playback.configurePlayer(mixWithOthers);
    },

    getCurrentState: () => playback.currentState(),

    play: () => {
      void playback.play();
    },
    pause: () => {
      void playback.pause();
    },
    skipToNextEntry: () => {
      void playback.skipToNextEntry();
    },
    skipToPreviousEntry: () => {
      void playback.skipToPreviousEntry();
    },
    restartCurrentEntry: () => {
      void playback.restartCurrentEntry();
    },
    seekToTime: (time: number) => {
      void playback.seekToTime(time);
    },
    togglePlayerState: () => {
      void playback.togglePlayerState();
    },
  };
}
