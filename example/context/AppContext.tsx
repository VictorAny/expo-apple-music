import {
  Auth,
  AuthStatus,
  type Album,
  type Artist,
  type Playlist,
  type Song,
  Player,
} from "@wwdrew/expo-apple-music";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

type AppContextValue = {
  authStatus: string;
  hasStoredSession: boolean;
  devToken: string | undefined;
  log: string;
  appendLog: (message: string) => void;
  clearLog: () => void;
  authorize: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  catalogSongs: Song[];
  setCatalogSongs: (songs: Song[]) => void;
  catalogAlbums: Album[];
  setCatalogAlbums: (albums: Album[]) => void;
  catalogArtists: Artist[];
  setCatalogArtists: (artists: Artist[]) => void;
  catalogPlaylists: Playlist[];
  setCatalogPlaylists: (playlists: Playlist[]) => void;
  selectedSongId: string | null;
  setSelectedSongId: (id: string | null) => void;
  selectedSong: Song | undefined;
  lastPlaylistId: string | null;
  setLastPlaylistId: (id: string | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState("checking…");
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [log, setLog] = useState("");
  const [catalogSongs, setCatalogSongs] = useState<Song[]>([]);
  const [catalogAlbums, setCatalogAlbums] = useState<Album[]>([]);
  const [catalogArtists, setCatalogArtists] = useState<Artist[]>([]);
  const [catalogPlaylists, setCatalogPlaylists] = useState<Playlist[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [lastPlaylistId, setLastPlaylistId] = useState<string | null>(null);

  const devToken = process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN;

  const appendLog = useCallback((message: string) => {
    setLog((prev) => `${message}\n${prev}`.slice(0, 4000));
  }, []);

  const clearLog = useCallback(() => setLog(""), []);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      await Auth.checkSubscription();
      setAuthStatus(AuthStatus.AUTHORIZED);
      setHasStoredSession(true);
      if (devToken) {
        await Auth.authorize(devToken);
        appendLog("stored developer token for catalog REST");
      }
      return true;
    } catch {
      setAuthStatus(AuthStatus.NOT_DETERMINED);
      setHasStoredSession(false);
      return false;
    }
  }, [appendLog, devToken]);

  const authorize = useCallback(async () => {
    try {
      if (!devToken) {
        appendLog(
          "warning: no EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN — iOS catalog search will 404. Run: npm run dev-token -- --write-env example/.env.local",
        );
      }
      const status = await Auth.authorize(devToken, {
        startScreenMessage:
          "Start screen message for <b>Expo Apple Music Example App</b>",
      });
      setAuthStatus(status);
      setHasStoredSession(status === AuthStatus.AUTHORIZED);
      appendLog(
        `authorize: ${status}${devToken ? " (developer token saved)" : ""}`,
      );
    } catch (error) {
      appendLog(`authorize error: ${String(error)}`);
    }
  }, [appendLog, devToken]);

  useEffect(() => {
    const sub = Player.addListener("onPlaybackError", (err) => {
      appendLog(
        `playback error: ${err.message} (code=${err.code}, op=${err.operation})`,
      );
    });
    return () => sub.remove();
  }, [appendLog]);

  useEffect(() => {
    void restoreSession().then((restored) => {
      if (restored) {
        appendLog("restored session from native storage");
      }
    });
  }, [appendLog, restoreSession]);

  const selectedSong = useMemo(
    () => catalogSongs.find((s) => s.id === selectedSongId),
    [catalogSongs, selectedSongId],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      authStatus,
      hasStoredSession,
      devToken,
      log,
      appendLog,
      clearLog,
      authorize,
      restoreSession,
      catalogSongs,
      setCatalogSongs,
      catalogAlbums,
      setCatalogAlbums,
      catalogArtists,
      setCatalogArtists,
      catalogPlaylists,
      setCatalogPlaylists,
      selectedSongId,
      setSelectedSongId,
      selectedSong,
      lastPlaylistId,
      setLastPlaylistId,
    }),
    [
      authStatus,
      hasStoredSession,
      devToken,
      log,
      appendLog,
      clearLog,
      authorize,
      restoreSession,
      catalogSongs,
      catalogAlbums,
      catalogArtists,
      catalogPlaylists,
      selectedSongId,
      selectedSong,
      lastPlaylistId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
