import type { EventSubscription } from 'expo-modules-core';
import type { IPlaybackState } from '../types/playback-state';
import type { ISong } from '../types/song';
import { MusicModule, musicEventEmitter } from '../native-module';

export interface IPlayerConfig {
  mixWithOthers: boolean;
}

interface IPlaybackTimeUpdate {
  playbackTime: number;
}

export interface IPlaybackError {
  message: string;
  code: number;
  domain: string;
  operation: 'play' | 'togglePlayback' | 'skipToNext' | 'skipToPrevious';
}

interface IPlayerEvents {
  onPlaybackStateChange: IPlaybackState;
  onCurrentSongChange: ISong;
  onPlaybackTimeUpdate: IPlaybackTimeUpdate;
  onPlaybackError: IPlaybackError;
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

  public static async getCurrentState(): Promise<IPlaybackState> {
    return (await MusicModule.getCurrentState()) as IPlaybackState;
  }

  public static addListener(
    eventType: keyof IPlayerEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (eventData: any) => void,
  ): EventSubscription {
    return musicEventEmitter.addListener(eventType, listener);
  }

  public static removeAllListeners(eventType: keyof IPlayerEvents): void {
    musicEventEmitter.removeAllListeners(eventType);
  }

  public static async configurePlayer(mixWithOthers = false): Promise<IPlayerConfig> {
    return (await MusicModule.configurePlayer(mixWithOthers)) as IPlayerConfig;
  }
}

export default Player;
