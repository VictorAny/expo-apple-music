/** Minimal MusicKit JS v3 surface used by the web bridge. */

export type MusicKitAuthorizeStatus = string;

export interface MusicKitMediaItem {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export interface MusicKitPlayer {
  nowPlayingItem: MusicKitMediaItem | null;
  currentPlaybackTime: number;
  currentPlaybackDuration: number;
  playbackState: string;
  isPlaying: boolean;
}

export interface MusicKitApiResponse {
  data?: unknown;
  results?: Record<string, { data?: unknown[] }>;
  errors?: { detail?: string }[];
}

export interface MusicKitInstance {
  isAuthorized: boolean;
  authorize(): Promise<MusicKitAuthorizeStatus>;
  play(): Promise<void>;
  pause(): Promise<void>;
  skipToNextItem(): Promise<void>;
  skipToPreviousItem(): Promise<void>;
  seekToTime(time: number): Promise<void>;
  restart(): Promise<void>;
  setQueue(options: Record<string, unknown>): Promise<void>;
  queue: { items?: MusicKitMediaItem[] };
  player: MusicKitPlayer;
  nowPlayingItem: MusicKitMediaItem | null;
  currentPlaybackTime: number;
  isPlaying: boolean;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
  api: {
    music(
      path: string,
      options?: {
        method?: string;
        body?: unknown;
        fetchOptions?: RequestInit;
      },
    ): Promise<MusicKitApiResponse>;
  };
}

export interface MusicKitStatic {
  configure(options: {
    developerToken: string;
    app: { name: string; build: string };
  }): Promise<MusicKitInstance>;
  getInstance(): MusicKitInstance;
}

declare global {
  interface Window {
    MusicKit?: MusicKitStatic;
  }
}
