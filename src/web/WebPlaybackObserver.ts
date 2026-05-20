import { WebPlaybackController } from './WebPlaybackController';
import { getMusicIfConfigured } from './MusicKitLoader';

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
  private activeEmitter: PlaybackEmitter | null = null;
  private musicKitListenersAttached = false;
  private readonly playback = new WebPlaybackController();
  private readonly handlers = {
    playbackState: () => {
      const emitter = this.activeEmitter;
      if (emitter) {
        void this.emitState(emitter);
      }
    },
    mediaItem: () => {
      const emitter = this.activeEmitter;
      if (emitter) {
        void this.emitCurrentSong(emitter);
      }
    },
  };

  start(emitter: PlaybackEmitter): void {
    this.stop();
    this.activeEmitter = emitter;
    void this.attachMusicKitListeners(emitter);
    this.intervalId = setInterval(() => {
      void this.tick();
    }, 1000);
  }

  stop(): void {
    this.activeEmitter = null;
    this.musicKitListenersAttached = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    void this.detachMusicKitListeners();
  }

  hasListeners(emitter: PlaybackEmitter): boolean {
    return PLAYBACK_EVENTS.some((event) => emitter.listenerCount(event) > 0);
  }

  private async tick(): Promise<void> {
    const emitter = this.activeEmitter;
    if (!emitter) {
      return;
    }
    if (!this.musicKitListenersAttached) {
      await this.attachMusicKitListeners(emitter);
    }
    await this.emitTimeUpdate(emitter);
  }

  private async attachMusicKitListeners(emitter: PlaybackEmitter): Promise<void> {
    if (this.musicKitListenersAttached) {
      return;
    }
    const music = await getMusicIfConfigured();
    if (!music) {
      return;
    }
    music.addEventListener('playbackStateDidChange', this.handlers.playbackState);
    music.addEventListener('mediaItemDidChange', this.handlers.mediaItem);
    this.musicKitListenersAttached = true;
    await this.emitState(emitter);
    await this.emitCurrentSong(emitter);
  }

  private async detachMusicKitListeners(): Promise<void> {
    if (!this.musicKitListenersAttached) {
      return;
    }
    const music = await getMusicIfConfigured();
    if (!music) {
      return;
    }
    music.removeEventListener('playbackStateDidChange', this.handlers.playbackState);
    music.removeEventListener('mediaItemDidChange', this.handlers.mediaItem);
    this.musicKitListenersAttached = false;
  }

  private async emitState(emitter: PlaybackEmitter): Promise<void> {
    if (emitter.listenerCount('onPlaybackStateChange') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter.emit('onPlaybackStateChange', state);
  }

  private async emitCurrentSong(emitter: PlaybackEmitter): Promise<void> {
    if (emitter.listenerCount('onCurrentSongChange') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter.emit('onCurrentSongChange', { currentSong: state.currentSong });
  }

  private async emitTimeUpdate(emitter: PlaybackEmitter): Promise<void> {
    if (emitter.listenerCount('onPlaybackTimeUpdate') === 0) {
      return;
    }
    const state = await this.playback.currentState();
    emitter.emit('onPlaybackTimeUpdate', { playbackTime: state.playbackTime ?? 0 });
  }
}
