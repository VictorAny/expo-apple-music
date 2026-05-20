import type { EventSubscription } from 'expo-modules-core';
import { callNative } from '../api/call-native';
import { assertLibraryId } from '../api/library-ids';
import type { MusicItem } from '../types/music-item';
import type { PlaybackState } from '../types/playback-state';
import type { Song } from '../types/song';
import { MusicModule, musicEventEmitter } from '../native-module';

export interface PlayerConfig {
  mixWithOthers: boolean;
}

interface PlaybackTimeUpdate {
  playbackTime: number;
}

export interface PlaybackError {
  message: string;
  code: number;
  domain: string;
  operation: 'play' | 'togglePlayback' | 'skipToNext' | 'skipToPrevious';
}

interface PlayerEvents {
  onPlaybackStateChange: PlaybackState;
  onCurrentSongChange: Song;
  onPlaybackTimeUpdate: PlaybackTimeUpdate;
  onPlaybackError: PlaybackError;
}

class Player {
  public static async setQueue(itemId: string, type: MusicItem): Promise<void> {
    await callNative('Player.setQueue', async () => {
      await MusicModule.setPlaybackQueue(itemId, type);
    });
  }

  public static async playLibrarySong(songId: string): Promise<void> {
    assertLibraryId(songId, 'songId');
    await callNative('Player.playLibrarySong', async () => {
      await MusicModule.playLibrarySong(songId);
    });
  }

  public static async playLibraryPlaylist(playlistId: string, startingAt = -1): Promise<void> {
    assertLibraryId(playlistId, 'playlistId');
    await callNative('Player.playLibraryPlaylist', async () => {
      await MusicModule.playLibraryPlaylist(playlistId, startingAt);
    });
  }

  public static skipToNextEntry(): void {
    MusicModule.skipToNextEntry();
  }

  public static skipToPreviousEntry(): void {
    MusicModule.skipToPreviousEntry();
  }

  public static restartCurrentEntry(): void {
    MusicModule.restartCurrentEntry();
  }

  public static seekToTime(time: number): void {
    MusicModule.seekToTime(time);
  }

  public static togglePlayerState(): void {
    MusicModule.togglePlayerState();
  }

  public static play(): void {
    MusicModule.play();
  }

  public static pause(): void {
    MusicModule.pause();
  }

  public static async getCurrentState(): Promise<PlaybackState> {
    return callNative('Player.getCurrentState', async () =>
      (await MusicModule.getCurrentState()) as PlaybackState,
    );
  }

  public static addListener(
    eventType: keyof PlayerEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (eventData: any) => void,
  ): EventSubscription {
    return musicEventEmitter.addListener(eventType, listener);
  }

  public static removeAllListeners(eventType: keyof PlayerEvents): void {
    musicEventEmitter.removeAllListeners(eventType);
  }

  public static async configurePlayer(mixWithOthers = false): Promise<PlayerConfig> {
    return callNative('Player.configurePlayer', async () =>
      (await MusicModule.configurePlayer(mixWithOthers)) as PlayerConfig,
    );
  }
}

export default Player;
