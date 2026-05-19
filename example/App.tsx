import {
  Auth,
  AuthStatus,
  CatalogSearchType,
  type IAlbum,
  type ISong,
  MusicItem,
  MusicKit,
  Player,
} from "@wwdrew/expo-apple-music";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PlayerBar } from "./components/PlayerBar";

export default function App() {
  const [authStatus, setAuthStatus] = useState<string>("checking…");
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [log, setLog] = useState<string>("");
  const [songs, setSongs] = useState<ISong[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const devToken =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN
      : undefined;

  const appendLog = useCallback((message: string) => {
    setLog((prev) => `${message}\n${prev}`.slice(0, 2000));
  }, []);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    try {
      await Auth.checkSubscription();
      setAuthStatus(AuthStatus.AUTHORIZED);
      setHasStoredSession(true);
      return true;
    } catch {
      setAuthStatus(AuthStatus.NOT_DETERMINED);
      setHasStoredSession(false);
      return false;
    }
  }, []);

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
        appendLog("restored session from native storage (no Apple Music trip)");
      }
    });
  }, [appendLog, restoreSession]);

  async function authorize(developerToken?: string) {
    try {
      const status = await Auth.authorize(developerToken, {
        startScreenMessage:
          "Start screen message for <b>Expo Apple MusicExample App</b>",
      });
      setAuthStatus(status);
      setHasStoredSession(status === AuthStatus.AUTHORIZED);
      appendLog(`authorize: ${status}`);
    } catch (error) {
      appendLog(`authorize error: ${String(error)}`);
    }
  }

  async function search() {
    try {
      const result = await MusicKit.catalogSearch(
        "Beatles",
        [CatalogSearchType.SONGS, CatalogSearchType.ALBUMS],
        { limit: 5 },
      );
      setSongs(result.songs);
      setAlbums(result.albums);
      const first = result.songs[0];
      if (first) {
        setSelectedSongId(first.id);
      }
      appendLog(
        `search: ${result.songs.length} songs, ${result.albums.length} albums`,
      );
    } catch (error) {
      appendLog(`search error: ${String(error)}`);
    }
  }

  async function playSong(song: ISong) {
    setSelectedSongId(song.id);
    try {
      await Player.configurePlayer(false);
      await MusicKit.setPlaybackQueue(song.id, MusicItem.SONG);
      const state = await Player.getCurrentState();
      appendLog(`playing: ${song.title} (${state.playbackStatus})`);
    } catch (error) {
      appendLog(`play error: ${String(error)}`);
    }
  }

  async function playAlbum(album: IAlbum) {
    try {
      await Player.configurePlayer(false);
      await MusicKit.setPlaybackQueue(album.id, MusicItem.ALBUM);
      const state = await Player.getCurrentState();
      appendLog(`playing album: ${album.title} (${state.playbackStatus})`);
    } catch (error) {
      appendLog(`play album error: ${String(error)}`);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>@wwdrew/expo-apple-music</Text>
          <Text>Auth: {authStatus}</Text>
          {hasStoredSession && (
            <Text style={styles.hint}>
              Signed in from a previous run — search and play work without
              opening Apple Music again.
            </Text>
          )}
          {Platform.OS === "android" && !devToken && (
            <Text style={styles.hint}>
              See docs/CLI.md: npm run dev-token -- --write-env
              example/.env.local then restart Metro.
            </Text>
          )}
          <View style={styles.row}>
            <Button
              title={hasStoredSession ? "Re-authorize" : "Authorize"}
              onPress={() => authorize(devToken)}
              disabled={Platform.OS === "android" && !devToken}
            />
            <Button title="Search Beatles" onPress={search} />
          </View>

          {songs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Songs ({songs.length})</Text>
              <Text style={styles.sectionHint}>Tap a row to queue & play</Text>
              {songs.map((song) => (
                <Pressable
                  key={song.id}
                  style={[
                    styles.resultRow,
                    selectedSongId === song.id && styles.resultRowSelected,
                  ]}
                  onPress={() => playSong(song)}
                >
                  <Text style={styles.resultTitle}>{song.title}</Text>
                  <Text style={styles.resultMeta}>{song.artistName}</Text>
                  <Text style={styles.resultId}>id: {song.id}</Text>
                  <Text style={styles.resultMeta}>
                    duration: {formatDuration(song.duration)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {albums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Albums ({albums.length})</Text>
              <Text style={styles.sectionHint}>
                Tap an album to queue all tracks — skip next/prev works in the
                player
              </Text>
              {albums.map((album) => (
                <Pressable
                  key={album.id}
                  style={styles.resultRow}
                  onPress={() => playAlbum(album)}
                >
                  <Text style={styles.resultTitle}>{album.title}</Text>
                  <Text style={styles.resultMeta}>{album.artistName}</Text>
                  <Text style={styles.resultId}>id: {album.id}</Text>
                  <Text style={styles.resultMeta}>
                    tracks: {album.trackCount}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {log.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Log</Text>
              <Text style={styles.log}>{log}</Text>
            </>
          )}
        </ScrollView>
        <PlayerBar
          onPlaybackError={(message) => appendLog(`player: ${message}`)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function formatDuration(duration: number | string): string {
  const ms = typeof duration === "string" ? Number(duration) : duration;
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const totalSec = ms > 1000 ? Math.floor(ms / 1000) : Math.floor(ms);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const styles = {
  header: { fontSize: 22, fontWeight: "600" as const, marginBottom: 12 },
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  scroll: { padding: 16, paddingBottom: 180 },
  row: { gap: 8, marginVertical: 12 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600" as const, marginBottom: 4 },
  sectionHint: { fontSize: 12, color: "#666", marginBottom: 8 },
  resultRow: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  resultRowSelected: {
    borderColor: "#007aff",
    backgroundColor: "#f0f7ff",
  },
  resultTitle: { fontSize: 15, fontWeight: "600" as const },
  resultMeta: { fontSize: 13, color: "#444", marginTop: 2 },
  resultId: {
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  log: { fontFamily: "Menlo", fontSize: 11, color: "#333", marginTop: 4 },
  hint: { fontSize: 12, color: "#555", marginVertical: 8 },
};
