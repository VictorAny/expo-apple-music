import {
  Auth,
  AuthStatus,
  Catalog,
  CatalogChartType,
  CatalogSearchType,
  History,
  Library,
  LibraryMutations,
  LibraryResourceType,
  Ratings,
  Recommendations,
  RatingResourceType,
  RatingValue,
  PlaylistTrackType,
  type Album,
  type Artist,
  type RecentResource,
  type Song,
  type Station,
  type UserTrack,
  MusicItem,
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
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [catalogArtists, setCatalogArtists] = useState<Artist[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [libraryArtists, setLibraryArtists] = useState<Artist[]>([]);
  const [libraryAlbums, setLibraryAlbums] = useState<Album[]>([]);
  const [recentTracks, setRecentTracks] = useState<Song[]>([]);
  const [recentResources, setRecentResources] = useState<UserTrack[]>([]);
  const [heavyRotation, setHeavyRotation] = useState<RecentResource[]>([]);
  const [recentStations, setRecentStations] = useState<Station[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<RecentResource[]>([]);

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
      const result = await Catalog.search(
        "Beatles",
        [
          CatalogSearchType.SONGS,
          CatalogSearchType.ALBUMS,
          CatalogSearchType.ARTISTS,
          CatalogSearchType.PLAYLISTS,
        ],
        { limit: 5 },
      );
      setSongs(result.songs);
      setAlbums(result.albums);
      setCatalogArtists(result.artists);
      const first = result.songs[0];
      if (first) {
        setSelectedSongId(first.id);
      }
      appendLog(
        `search: ${result.songs.length} songs, ${result.albums.length} albums, ${result.artists.length} artists, ${result.playlists.length} playlists`,
      );
    } catch (error) {
      appendLog(`search error: ${String(error)}`);
    }
  }

  async function browseArtist(artist: Artist) {
    try {
      const detail = await Catalog.getArtist(artist.id);
      const artistAlbums = await Catalog.getArtistAlbums(artist.id, { limit: 10 });
      appendLog(
        `artist: ${detail.name} · ${artistAlbums.albums.length} album(s) from API`,
      );
    } catch (error) {
      appendLog(`artist browse error: ${String(error)}`);
    }
  }

  async function browseAlbum(album: Album) {
    try {
      const detail = await Catalog.getAlbum(album.id);
      const tracks = await Catalog.getAlbumTracks(album.id, { limit: 25 });
      appendLog(
        `album detail: ${detail.title} · ${tracks.songs.length} track(s) from API`,
      );
      if (tracks.songs.length > 0) {
        await playSong(tracks.songs[0]);
      } else {
        await playAlbum(album);
      }
    } catch (error) {
      appendLog(`album browse error: ${String(error)}`);
    }
  }

  async function playSong(song: Song) {
    setSelectedSongId(song.id);
    try {
      await Player.configurePlayer(false);
      await Player.setQueue(song.id, MusicItem.SONG);
      const state = await Player.getCurrentState();
      appendLog(`playing: ${song.title} (${state.playbackStatus})`);
    } catch (error) {
      appendLog(`play error: ${String(error)}`);
    }
  }

  async function loadCharts() {
    try {
      const charts = await Catalog.getCharts(
        [CatalogChartType.SONGS, CatalogChartType.ALBUMS],
        { limit: 10 },
      );
      setSongs(charts.songs);
      setAlbums(charts.albums);
      appendLog(
        `charts: ${charts.songs.length} songs, ${charts.albums.length} albums`,
      );
    } catch (error) {
      appendLog(`charts error: ${String(error)}`);
    }
  }

  async function loadStorefront() {
    try {
      const storefront = await Auth.getStorefront();
      appendLog(`storefront: ${storefront.id}`);
    } catch (error) {
      appendLog(`storefront error: ${String(error)}`);
    }
  }

  async function loadLibraryAndHistory() {
    try {
      const [artists, albums, tracks, resources, rotation, stations, added] =
        await Promise.all([
          Library.getArtists({ limit: 10 }),
          Library.getAlbums({ limit: 10 }),
          History.getRecentlyPlayedTracks({ limit: 10 }),
          History.getRecentlyPlayedResources(),
          History.getHeavyRotation({ limit: 10 }),
          History.getRecentlyPlayedStations({ limit: 10 }),
          History.getRecentlyAdded({ limit: 10 }),
        ]);
      setLibraryArtists(artists.artists);
      setLibraryAlbums(albums.albums);
      setRecentTracks(tracks.songs);
      setRecentResources(resources.recentlyPlayedItems);
      setHeavyRotation(rotation.items);
      setRecentStations(stations.stations);
      setRecentlyAdded(added.items);
      appendLog(
        `library: ${artists.artists.length} artists, ${albums.albums.length} albums · history: ${tracks.songs.length} tracks, ${rotation.items.length} heavy, ${stations.stations.length} stations, ${added.items.length} added`,
      );
    } catch (error) {
      appendLog(`library/history error: ${String(error)}`);
    }
  }

  async function likeSelectedSong() {
    const song = songs.find((s) => s.id === selectedSongId);
    if (!song) {
      appendLog("like: search first and select a song");
      return;
    }
    try {
      const rating = await Ratings.setRating(
        RatingResourceType.SONG,
        song.id,
        RatingValue.LIKE,
      );
      appendLog(`like: ${song.title} → rating ${rating.value}`);
    } catch (error) {
      appendLog(`like error: ${String(error)}`);
    }
  }

  async function addSelectedSongToLibrary() {
    const song = songs.find((s) => s.id === selectedSongId);
    if (!song) {
      appendLog("add to library: search first and select a song");
      return;
    }
    try {
      await LibraryMutations.addToLibrary({
        [LibraryResourceType.SONGS]: [song.id],
      });
      appendLog(`add to library: ${song.title} (202 — may take a moment to appear)`);
    } catch (error) {
      appendLog(`add to library error: ${String(error)}`);
    }
  }

  async function loadRecommendations() {
    try {
      const result = await Recommendations.get();
      const first = result.recommendations[0];
      const mixCount = first?.playlists.length ?? 0;
      appendLog(
        `recommendations: ${result.recommendations.length} group(s)` +
          (first ? ` — "${first.title}" with ${mixCount} playlist(s)` : ""),
      );
    } catch (error) {
      appendLog(`recommendations error: ${String(error)}`);
    }
  }

  async function createTestPlaylist() {
    const song = songs.find((s) => s.id === selectedSongId);
    try {
      const playlist = await LibraryMutations.createPlaylist({
        name: `Expo test ${new Date().toISOString().slice(11, 19)}`,
        description: "Created from expo-apple-music example",
        tracks: song
          ? [{ id: song.id, type: PlaylistTrackType.SONG }]
          : undefined,
      });
      appendLog(`create playlist: ${playlist.name} (${playlist.id})`);
    } catch (error) {
      appendLog(`create playlist error: ${String(error)}`);
    }
  }

  async function playAlbum(album: Album) {
    try {
      await Player.configurePlayer(false);
      await Player.setQueue(album.id, MusicItem.ALBUM);
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
            <Button title="Charts" onPress={loadCharts} />
            <Button title="Storefront" onPress={loadStorefront} />
            <Button title="Library & history" onPress={loadLibraryAndHistory} />
          </View>
          <View style={styles.row}>
            <Button title="Like song" onPress={likeSelectedSong} />
            <Button title="Add to library" onPress={addSelectedSongToLibrary} />
            <Button title="New playlist" onPress={createTestPlaylist} />
            <Button title="Recommendations" onPress={loadRecommendations} />
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

          {catalogArtists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Catalog artists ({catalogArtists.length})
              </Text>
              <Text style={styles.sectionHint}>
                Tap to load albums via Catalog.getArtistAlbums
              </Text>
              {catalogArtists.map((artist) => (
                <Pressable
                  key={artist.id}
                  style={styles.resultRow}
                  onPress={() => browseArtist(artist)}
                >
                  <Text style={styles.resultTitle}>{artist.name}</Text>
                  <Text style={styles.resultId}>id: {artist.id}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {libraryAlbums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Library albums ({libraryAlbums.length})
              </Text>
              {libraryAlbums.map((album) => (
                <Pressable
                  key={album.id}
                  style={styles.resultRow}
                  onPress={() => playAlbum(album)}
                >
                  <Text style={styles.resultTitle}>{album.title}</Text>
                  <Text style={styles.resultMeta}>{album.artistName}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {libraryArtists.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Library artists ({libraryArtists.length})
              </Text>
              {libraryArtists.map((artist) => (
                <View key={artist.id} style={styles.resultRow}>
                  <Text style={styles.resultTitle}>{artist.name}</Text>
                  <Text style={styles.resultId}>id: {artist.id}</Text>
                </View>
              ))}
            </View>
          )}

          {recentTracks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recently played tracks ({recentTracks.length})
              </Text>
              {recentTracks.map((song) => (
                <Pressable
                  key={song.id}
                  style={styles.resultRow}
                  onPress={() => playSong(song)}
                >
                  <Text style={styles.resultTitle}>{song.title}</Text>
                  <Text style={styles.resultMeta}>{song.artistName}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {heavyRotation.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Heavy rotation ({heavyRotation.length})
              </Text>
              {heavyRotation.map((item) => (
                <View key={item.id} style={styles.resultRow}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultMeta}>
                    {item.type} · {item.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {recentStations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recent stations ({recentStations.length})
              </Text>
              {recentStations.map((station) => (
                <View key={station.id} style={styles.resultRow}>
                  <Text style={styles.resultTitle}>{station.name}</Text>
                </View>
              ))}
            </View>
          )}

          {recentlyAdded.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recently added ({recentlyAdded.length})
              </Text>
              {recentlyAdded.map((item) => (
                <View key={item.id} style={styles.resultRow}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultMeta}>
                    {item.type} · {item.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {recentResources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Recently played resources ({recentResources.length})
              </Text>
              {recentResources.map((item) => (
                <View key={String(item.id)} style={styles.resultRow}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  <Text style={styles.resultMeta}>
                    {item.type} · {item.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {albums.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Albums ({albums.length})</Text>
              <Text style={styles.sectionHint}>
                Tap an album to load tracks via Catalog.getAlbumTracks, then play
              </Text>
              {albums.map((album) => (
                <Pressable
                  key={album.id}
                  style={styles.resultRow}
                  onPress={() => browseAlbum(album)}
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
