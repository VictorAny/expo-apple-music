import {
  LibraryMutations,
  LibraryResourceType,
  PlaylistTrackType,
} from "@wwdrew/expo-apple-music";
import { useEffect, useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { IdField } from "../components/IdField";
import { useApp } from "../context/AppContext";
import { RunButton } from "./helpers";

function useSongIdField() {
  const { catalogSongs, selectedSongId } = useApp();
  const [songId, setSongId] = useState(selectedSongId ?? catalogSongs[0]?.id ?? "");
  useEffect(() => {
    if (!songId && (selectedSongId || catalogSongs[0]?.id)) {
      setSongId(selectedSongId ?? catalogSongs[0]?.id ?? "");
    }
  }, [catalogSongs, selectedSongId, songId]);
  return { songId, setSongId };
}

export function AddToLibraryDemo() {
  const { appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run addToLibrary({ songs: [id] })"
          disabled={!songId.trim()}
          onPress={() => {
            void LibraryMutations.addToLibrary({
              [LibraryResourceType.SONGS]: [songId.trim()],
            })
              .then(() =>
                appendLog(`added ${songId.trim()} (may take a moment to appear)`),
              )
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}

export function CreatePlaylistDemo() {
  const { appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField
          label="Optional initial track id"
          value={songId}
          onChangeText={setSongId}
          hint="Leave blank to create an empty playlist."
        />
      }
      actions={
        <RunButton
          title="Run createPlaylist({ name, tracks? })"
          onPress={() => {
            void LibraryMutations.createPlaylist({
              name: `Expo test ${new Date().toISOString().slice(11, 19)}`,
              description: "Created from expo-apple-music example",
              tracks: songId.trim()
                ? [{ id: songId.trim(), type: PlaylistTrackType.SONG }]
                : undefined,
            })
              .then((p) => appendLog(`created: ${p.name} (${p.id})`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}

export function AddTracksToPlaylistDemo() {
  const { appendLog, lastPlaylistId } = useApp();
  const { songId, setSongId } = useSongIdField();
  const [playlistId, setPlaylistId] = useState(lastPlaylistId ?? "");
  useEffect(() => {
    if (!playlistId && lastPlaylistId) setPlaylistId(lastPlaylistId);
  }, [lastPlaylistId, playlistId]);

  return (
    <ApiScreen
      headerExtra={
        <>
          <IdField
            label="Playlist id"
            value={playlistId}
            onChangeText={setPlaylistId}
          />
          <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
        </>
      }
      actions={
        <RunButton
          title="Run addTracksToPlaylist(playlistId, tracks)"
          disabled={!playlistId.trim() || !songId.trim()}
          onPress={() => {
            void LibraryMutations.addTracksToPlaylist(playlistId.trim(), [
              { id: songId.trim(), type: PlaylistTrackType.SONG },
            ])
              .then(() => appendLog(`added track to playlist ${playlistId.trim()}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}
