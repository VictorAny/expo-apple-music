import {
  Catalog,
  CatalogSearchType,
  type Album,
  type Artist,
  type Playlist,
  type Song,
} from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../context/AppContext";
import { isAuthorized } from "../lib/auth";
import { formatApiError } from "../lib/format-error";
import { theme } from "../lib/theme";
import { RunButton } from "../demos/helpers";

type CatalogSearchFieldProps = {
  onResults?: (result: {
    songs: Song[];
    albums: Album[];
    artists: Artist[];
    playlists: Playlist[];
  }) => void;
  limit?: number;
};

export function CatalogSearchField({ onResults, limit = 10 }: CatalogSearchFieldProps) {
  const {
    appendLog,
    devToken,
    authStatus,
    setCatalogSongs,
    setCatalogAlbums,
    setCatalogArtists,
    setCatalogPlaylists,
    setSelectedSongId,
  } = useApp();
  const [term, setTerm] = useState("Beatles");

  async function runSearch() {
    if (Platform.OS === "android" && !devToken?.trim()) {
      appendLog(
        "Search blocked: authorize first (developer JWT via AppleMusic.configure).",
      );
      return;
    }
    try {
      const result = await Catalog.search(
        term.trim() || "Beatles",
        [
          CatalogSearchType.SONGS,
          CatalogSearchType.ALBUMS,
          CatalogSearchType.ARTISTS,
          CatalogSearchType.PLAYLISTS,
        ],
        { limit },
      );
      setCatalogSongs(result.songs);
      setCatalogAlbums(result.albums);
      setCatalogArtists(result.artists);
      setCatalogPlaylists(result.playlists);
      if (result.songs[0]) setSelectedSongId(result.songs[0].id);
      onResults?.(result);
      appendLog(
        `"${term}" → songs: ${result.songs.length}, albums: ${result.albums.length}, ` +
          `artists: ${result.artists.length}, playlists: ${result.playlists.length}`,
      );
    } catch (e) {
      appendLog(`search error: ${formatApiError(e)}`);
    }
  }

  const needsTokenHint = Platform.OS === "android" && !devToken?.trim();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Search term</Text>
      <TextInput
        style={styles.input}
        value={term}
        onChangeText={setTerm}
        placeholder="Artist, album, song…"
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
        editable={isAuthorized(authStatus)}
      />
      {needsTokenHint ? (
        <Text style={styles.hint}>
          Android requires a developer JWT — tap Authorize after configuring a token.
        </Text>
      ) : null}
      <RunButton
        title={`Search "${term.trim() || "…"}"`}
        onPress={() => void runSearch()}
        disabled={!term.trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: theme.text },
  input: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.card,
    fontSize: 15,
    color: theme.text,
  },
  hint: { fontSize: 11, color: theme.muted, lineHeight: 16 },
});
