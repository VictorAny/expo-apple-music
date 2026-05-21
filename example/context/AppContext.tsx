import {
  Auth,
  AuthStatus,
  type Album,
  type Artist,
  type AuthorizeResult,
  type Playlist,
  type Song,
  Player,
} from "@wwdrew/expo-apple-music";
import { fetchExampleDeveloperToken } from "../lib/apple-music-developer-token";
import { formatApiError } from "../lib/format-error";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";

type AppContextValue = {
  authStatus: string;
  musicUserToken: string | undefined;
  hasStoredSession: boolean;
  devToken: string | undefined;
  log: string;
  logVisible: boolean;
  logUnread: boolean;
  appendLog: (message: string) => void;
  clearLog: () => void;
  toggleLogVisible: () => void;
  markLogRead: () => void;
  authorize: () => Promise<void>;
  clearMusicSession: () => void;
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
  const [musicUserToken, setMusicUserToken] = useState<string | undefined>(
    undefined,
  );
  const [log, setLog] = useState("");
  const [logVisible, setLogVisible] = useState(false);
  const [logUnread, setLogUnread] = useState(false);
  const logVisibleRef = useRef(false);
  logVisibleRef.current = logVisible;
  const [catalogSongs, setCatalogSongs] = useState<Song[]>([]);
  const [catalogAlbums, setCatalogAlbums] = useState<Album[]>([]);
  const [catalogArtists, setCatalogArtists] = useState<Artist[]>([]);
  const [catalogPlaylists, setCatalogPlaylists] = useState<Playlist[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [lastPlaylistId, setLastPlaylistId] = useState<string | null>(null);

  const [devToken, setDevToken] = useState<string | undefined>(
    () => process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN,
  );

  const hasStoredSession = Boolean(musicUserToken);

  const appendLog = useCallback((message: string) => {
    setLog((prev) => `${message}\n${prev}`.slice(0, 4000));
    if (!logVisibleRef.current) {
      setLogUnread(true);
    }
  }, []);

  const clearLog = useCallback(() => {
    setLog("");
    setLogUnread(false);
  }, []);

  const toggleLogVisible = useCallback(() => {
    setLogVisible((visible) => {
      const next = !visible;
      if (next) setLogUnread(false);
      return next;
    });
  }, []);

  const markLogRead = useCallback(() => setLogUnread(false), []);

  const clearMusicSession = useCallback(() => {
    setMusicUserToken(undefined);
    setAuthStatus(AuthStatus.NOT_DETERMINED);
    appendLog("cleared music user token");
  }, [appendLog]);

  const applyAuthorizeResult = useCallback(
    (result: AuthorizeResult) => {
      setAuthStatus(result.status);
      if (result.status === AuthStatus.AUTHORIZED && result.musicUserToken) {
        setMusicUserToken(result.musicUserToken);
      } else {
        setMusicUserToken(undefined);
      }
    },
    [],
  );

  const authorize = useCallback(async () => {
    try {
      const jwt = await fetchExampleDeveloperToken();
      setDevToken(jwt);
      const result = await Auth.authorize(jwt, {
        startScreenMessage:
          "Start screen message for <b>Expo Apple Music Example App</b>",
      });
      applyAuthorizeResult(result);
      appendLog(
        `authorize: ${result.status}${result.musicUserToken ? " (music user token stored in app)" : ""}`,
      );
    } catch (error) {
      appendLog(`authorize error: ${formatApiError(error)}`);
    }
  }, [appendLog, applyAuthorizeResult]);

  useEffect(() => {
    if (Platform.OS !== "android" && Platform.OS !== "web") {
      return;
    }
    const env = process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN?.trim();
    if (!env) {
      return;
    }
    void Auth.setDeveloperToken(env)
      .then(() => appendLog("developer JWT synced to native"))
      .catch((error) =>
        appendLog(`setDeveloperToken error: ${formatApiError(error)}`),
      );
  }, [appendLog]);

  useEffect(() => {
    const sub = Player.addListener("onPlaybackError", (err) => {
      appendLog(
        `playback error: ${err.message} (code=${err.code}, op=${err.operation})`,
      );
    });
    return () => sub.remove();
  }, [appendLog]);

  useEffect(() => {
    if (!musicUserToken) {
      setAuthStatus(AuthStatus.NOT_DETERMINED);
    }
  }, [musicUserToken]);

  const selectedSong = useMemo(
    () => catalogSongs.find((s) => s.id === selectedSongId),
    [catalogSongs, selectedSongId],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      authStatus,
      musicUserToken,
      hasStoredSession,
      devToken,
      log,
      logVisible,
      logUnread,
      appendLog,
      clearLog,
      toggleLogVisible,
      markLogRead,
      authorize,
      clearMusicSession,
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
      musicUserToken,
      hasStoredSession,
      devToken,
      log,
      logVisible,
      logUnread,
      appendLog,
      clearLog,
      toggleLogVisible,
      markLogRead,
      authorize,
      clearMusicSession,
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
