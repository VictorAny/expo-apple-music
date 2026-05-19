import {
  LibraryMutations,
  LibraryResourceType,
  PlaylistTrackType,
} from "@wwdrew/expo-apple-music";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { NeedSearchHint, RunButton, SelectedSongHint } from "./helpers";

export function AddToLibraryDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run addToLibrary({ songs: [id] })"
          disabled={!selectedSong}
          onPress={() => {
            void LibraryMutations.addToLibrary({
              [LibraryResourceType.SONGS]: [selectedSong!.id],
            })
              .then(() =>
                appendLog(
                  `added ${selectedSong!.title} (may take a moment to appear)`,
                ),
              )
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function CreatePlaylistDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run createPlaylist({ name, tracks? })"
          onPress={() => {
            void LibraryMutations.createPlaylist({
              name: `Expo test ${new Date().toISOString().slice(11, 19)}`,
              description: "Created from expo-apple-music example",
              tracks: selectedSong
                ? [{ id: selectedSong.id, type: PlaylistTrackType.SONG }]
                : undefined,
            })
              .then((p) => appendLog(`created: ${p.name} (${p.id})`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {selectedSong ? (
        <SelectedSongHint />
      ) : (
        <NeedSearchHint />
      )}
    </ApiScreen>
  );
}

export function AddTracksToPlaylistDemo() {
  const { appendLog, selectedSong, lastPlaylistId } = useApp();
  return (
    <ApiScreen
      hint="Select a playlist via Library → getPlaylists, and a song via Catalog → search."
      actions={
        <RunButton
          title="Run addTracksToPlaylist(playlistId, tracks)"
          disabled={!lastPlaylistId || !selectedSong}
          onPress={() => {
            void LibraryMutations.addTracksToPlaylist(lastPlaylistId!, [
              { id: selectedSong!.id, type: PlaylistTrackType.SONG },
            ])
              .then(() => appendLog(`added track to playlist ${lastPlaylistId}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}
