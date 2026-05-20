import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { PlaybackState } from '../types/playback-state';
import { PlaybackStatus } from '../types/playback-status';
import { getErrorMessage } from '../utils/get-error-message';

const useIsPlaying = (): { isPlaying: boolean; error?: Error } => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    Player.getCurrentState()
      .then((state: PlaybackState) =>
        setIsPlaying(state.playbackStatus === PlaybackStatus.PLAYING),
      )
      .catch((err) => setError(new Error(getErrorMessage(err))));

    const listener = Player.addListener('onPlaybackStateChange', (state: PlaybackState) => {
      setError(undefined);
      setIsPlaying(state.playbackStatus === PlaybackStatus.PLAYING);
    });

    return () => listener.remove();
  }, []);

  return { isPlaying, error };
};

export default useIsPlaying;
