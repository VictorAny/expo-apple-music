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
  /** Set after authorize — country code (e.g. `us`). Prefer over REST when present. */
  storefrontId?: string;
  /** Present on MusicKit JS v3 — numeric {@link MusicKitAuthorizationStatus}. */
  authorizationStatus?: number;
  isRestricted?: boolean;
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
      query?: Record<string, string>,
      options?: {
        method?: string;
        fetchOptions?: RequestInit;
      },
    ): Promise<unknown>;
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
