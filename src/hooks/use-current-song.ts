import { useEffect, useState } from 'react';
import Player from '../modules/player';
import type { PlaybackState } from '../types/playback-state';
import type { Song } from '../types/song';

/**
 * Listens for changes from the native music player and updates the currentSong state.
 */
const useCurrentSong = (): { song?: Song; error?: Error } => {
  const [currentSong, setCurrentSong] = useState<Song>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    Player.getCurrentState()
      .then((state) => setCurrentSong(state.currentSong))
      .catch(setError);

    const listener = Player.addListener('onCurrentSongChange', (state: PlaybackState) => {
      setError(undefined);
      setCurrentSong(state?.currentSong);
    });

    return () => listener.remove();
  }, []);

  return { song: currentSong, error };
};

export default useCurrentSong;
