import {
  History,
  Library,
  MusicItem,
  Recommendations,
  type Song,
} from "@wwdrew/expo-apple-music";
import { formatApiError } from "../lib/format-error";
import { requireMusicToken } from "../lib/require-music-token";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Accordion } from "../components/Accordion";
import { CatalogSearchField } from "../components/CatalogSearchField";
import { DemoScreen } from "../components/DemoScreen";
import { ItemRow } from "../components/ItemRow";
import { SectionHeader } from "../components/SectionHeader";
import { RunButton } from "../demos/helpers";
import { useApp } from "../context/AppContext";
import { isAuthorized } from "../lib/auth";
import { toDemoItems } from "../lib/demo-list";
import { formatDuration } from "../lib/format";
import { queueAndPlay } from "../lib/playback";
import { theme } from "../lib/theme";

export default function PlaygroundScreen() {
  const router = useRouter();
  const { musicUserToken, appendLog, authStatus } = useApp();
  const authorized = isAuthorized(authStatus);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [searchSongs, setSearchSongs] = useState<Song[]>([]);
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [historySongs, setHistorySongs] = useState<Song[]>([]);
  const [recTitles, setRecTitles] = useState<string[]>([]);

  useEffect(() => {
    if (authStatus !== "checking…" && !authorized) {
      router.replace("/");
    }
  }, [authStatus, authorized, router]);

  const searchItems = useMemo(
    () =>
      toDemoItems(
        searchSongs.map((song) => ({
          key: song.id,
          title: song.title,
          subtitle: song.artistName,
          meta: `${formatDuration(song.duration)} · tap to play`,
          onPress: () => {
            void queueAndPlay(song.id, MusicItem.SONG, appendLog).catch((e) =>
              appendLog(`play error: ${formatApiError(e)}`),
            );
          },
        })),
      ),
    [appendLog, searchSongs],
  );

  function toggleSection(section: string) {
    setOpenSection((current) => (current === section ? null : section));
  }

  function playSong(song: Song, label: string) {
    void queueAndPlay(song.id, MusicItem.SONG, appendLog)
      .then(() => appendLog(`${label}: ${song.title}`))
      .catch((e) => appendLog(`play error: ${formatApiError(e)}`));
  }

  if (!authorized) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: theme.muted }}>Authorize on home to use Playground.</Text>
      </View>
    );
  }

  const header = (
    <>
      <SectionHeader title="Catalog search" />
      <CatalogSearchField onResults={(result) => setSearchSongs(result.songs)} />
      <Accordion
        title="Library"
        open={openSection === "library"}
        onToggle={() => toggleSection("library")}
      >
        <RunButton
          title="Load my library songs"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getSongs(musicUserToken, { limit: 10 })
              .then((r) => {
                setLibrarySongs(r.songs);
                appendLog(`${r.songs.length} library song(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
        {librarySongs.map((song) => (
          <ItemRow
            key={song.id}
            title={song.title}
            subtitle={song.artistName}
            meta="tap to play"
            onPress={() => playSong(song, "library")}
          />
        ))}
      </Accordion>
      <Accordion
        title="History"
        open={openSection === "history"}
        onToggle={() => toggleSection("history")}
      >
        <RunButton
          title="Load recently played tracks"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getRecentlyPlayedTracks(musicUserToken, { limit: 10 })
              .then((r) => {
                setHistorySongs(r.songs);
                appendLog(`${r.songs.length} recent track(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
        {historySongs.map((song) => (
          <ItemRow
            key={song.id}
            title={song.title}
            subtitle={song.artistName}
            meta="tap to play"
            onPress={() => playSong(song, "recent")}
          />
        ))}
      </Accordion>
      <Accordion
        title="Recommendations"
        open={openSection === "recommendations"}
        onToggle={() => toggleSection("recommendations")}
      >
        <RunButton
          title="Load recommendations"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Recommendations.get(musicUserToken)
              .then((r) => {
                setRecTitles(r.recommendations.map((g) => g.title));
                appendLog(`${r.recommendations.length} recommendation group(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
        {recTitles.map((title, index) => (
          <ItemRow key={`${title}-${index}`} title={title} meta="Made for You group" />
        ))}
      </Accordion>
      {searchSongs.length > 0 ? <SectionHeader title="Search results" /> : null}
    </>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Playground" }} />
      <DemoScreen
        header={header}
        items={searchItems}
        ListEmptyComponent={
          searchSongs.length === 0 ? (
            <Text style={{ color: theme.muted, fontSize: 13 }}>
              Search above, then tap a song to queue and play.
            </Text>
          ) : null
        }
      />
    </>
  );
}
