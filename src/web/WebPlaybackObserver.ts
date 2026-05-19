import { WebPlaybackController } from './WebPlaybackController';
import { getMusic } from './MusicKitLoader';

const PLAYBACK_EVENTS = [
  'onPlaybackStateChange',
  'onCurrentSongChange',
  'onPlaybackTimeUpdate',
  'onPlaybackError',
] as const;

interface PlaybackEmitter {
  emit(eventName: string, payload: unknown): void;
  listenerCount(eventName: string): number;
}

export class WebPlaybackObserver {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly playback = new WebPlaybackController();
  private readonly handlers = {
    playbackState: () => void this.emitState(),
    mediaItem: () => void this.emitCurrentSong(),
  };

  start(emitter: PlaybackEmitter): void {
    this.stop();
    void this.attachMusicKitListeners(emitter);
    this.intervalId = setInterval(() => {
      void this.emitTimeUpdate(emitter);
    }, 1000);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    void this.detachMusicKitListeners();
  }

  hasListeners(emitter: PlaybackEmitter): boolean {
    return PLAYBACK_EVENTS.some((event) => emitter.listenerCount(event) > 0);
  }

  private async attachMusicKitListeners(emitter: PlaybackEmitter): Promise<void> {
    try {
      const music = await getMusic();
      music.addEventListener('playbackStateDidChange', this.handlers.playbackState);
      music.addEventListener('mediaItemDidChange', this.handlers.mediaItem);
      await this.emitState(emitter);
      await this.emitCurrentSong(emitter);
    } catch {
      // MusicKit not configured yet
    }
  }

  private async detachMusicKitListeners(): Promise<void> {
    try {
      const music = await getMusic();
      music.removeEventListener('playbackStateDidChange', this.handlers.playbackState);
      music.removeEventListener('mediaItemDidChange', this.handlers.mediaItem);
    } catch {
      // ignore
    }
  }

  private async emitState(emitter?: PlaybackEmitter): Promise<void> {
    if (emitter && emitter.listenerCount('onPlaybackStateChange') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter?.emit('onPlaybackStateChange', state);
  }

  private async emitCurrentSong(emitter?: PlaybackEmitter): Promise<void> {
    if (emitter && emitter.listenerCount('onCurrentSongChange') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter?.emit('onCurrentSongChange', state.currentSong ?? null);
  }

  private async emitTimeUpdate(emitter: PlaybackEmitter): Promise<void> {
    if (emitter.listenerCount('onPlaybackTimeUpdate') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter.emit('onPlaybackTimeUpdate', { playbackTime: state.playbackTime ?? 0 });
  }
}
