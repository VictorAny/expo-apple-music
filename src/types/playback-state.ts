import type { PlaybackStatus } from './playback-status';
import type { Song } from './song';

export interface PlaybackState {
  currentSong?: Song;
  playbackRate: number;
  playbackStatus: PlaybackStatus;
  playbackTime: number;
}
