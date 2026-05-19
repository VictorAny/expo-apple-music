import type { EventSubscription } from 'expo-modules-core';
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
    return (await MusicModule.getCurrentState()) as PlaybackState;
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
    return (await MusicModule.configurePlayer(mixWithOthers)) as PlayerConfig;
  }
}

export default Player;
