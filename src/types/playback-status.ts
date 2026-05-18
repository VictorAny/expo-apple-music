export const PlaybackStatus = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  INTERRUPTED: 'interrupted',
  SEEKING_FORWARD: 'seekingForward',
  SEEKING_BACKWARD: 'seekingBackward',
} as const;

export type PlaybackStatus = (typeof PlaybackStatus)[keyof typeof PlaybackStatus];
