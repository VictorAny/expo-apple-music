import { Player } from "@wwdrew/expo-apple-music";
import { useEffect } from "react";
import { Text } from "react-native";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { playCatalogAlbum, playCatalogSong } from "./catalog";
import { NeedSearchHint, RunButton } from "./helpers";

function useFirstIds() {
  const { catalogSongs, catalogAlbums, catalogPlaylists } = useApp();
  return {
    songId: catalogSongs[0]?.id,
    albumId: catalogAlbums[0]?.id,
    playlistId: catalogPlaylists[0]?.id,
  };
}

export function ConfigurePlayerDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run configurePlayer(false)"
          onPress={() => {
            void Player.configurePlayer(false)
              .then((c) => appendLog(`mixWithOthers: ${c.mixWithOthers}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}

export function SetQueueDemo() {
  const { appendLog, setSelectedSongId } = useApp();
  const { songId, albumId } = useFirstIds();
  return (
    <ApiScreen
      actions={
        <>
          <RunButton
            title="Queue first search song"
            disabled={!songId}
            onPress={() => {
              if (!songId) return;
              setSelectedSongId(songId);
              void playCatalogSong(songId, appendLog).catch((e) =>
                appendLog(`error: ${String(e)}`),
              );
            }}
          />
          <RunButton
            title="Queue first search album"
            disabled={!albumId}
            onPress={() => {
              if (!albumId) return;
              void playCatalogAlbum(albumId, appendLog).catch((e) =>
                appendLog(`error: ${String(e)}`),
              );
            }}
          />
        </>
      }
    >
      <NeedSearchHint />
    </ApiScreen>
  );
}

export function PlayLibrarySongDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      hint="Requires a library song id (not catalog). Load Library → getSongs first."
      actions={
        <RunButton
          title="Run playLibrarySong (needs library id)"
          onPress={() => {
            appendLog("Use a library song id from Library.getSongs");
          }}
        />
      }
    />
  );
}

export function PlayLibraryPlaylistDemo() {
  const { appendLog, lastPlaylistId } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run playLibraryPlaylist(id)"
          disabled={!lastPlaylistId}
          onPress={() => {
            void Player.playLibraryPlaylist(lastPlaylistId!)
              .then(() => appendLog(`playing playlist ${lastPlaylistId}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
      hint="Run Library → getPlaylists and tap a playlist to store its id."
    />
  );
}

export function GetCurrentStateDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getCurrentState()"
          onPress={() => {
            void Player.getCurrentState()
              .then((s) =>
                appendLog(
                  `status: ${s.playbackStatus}, time: ${s.playbackTime.toFixed(1)}s`,
                ),
              )
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}

export function PlayDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run play()"
          onPress={() => {
            try {
              Player.play();
              appendLog("play() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
      hint="Queue something first. Transport controls also live in the player bar."
    />
  );
}

export function PauseDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run pause()"
          onPress={() => {
            try {
              Player.pause();
              appendLog("pause() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
    />
  );
}

export function TogglePlayerStateDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run togglePlayerState()"
          onPress={() => {
            try {
              Player.togglePlayerState();
              appendLog("togglePlayerState() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
    />
  );
}

export function SkipToNextEntryDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run skipToNextEntry()"
          onPress={() => {
            try {
              Player.skipToNextEntry();
              appendLog("skipToNextEntry() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
    />
  );
}

export function SkipToPreviousEntryDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run skipToPreviousEntry()"
          onPress={() => {
            try {
              Player.skipToPreviousEntry();
              appendLog("skipToPreviousEntry() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
    />
  );
}

export function RestartCurrentEntryDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run restartCurrentEntry()"
          onPress={() => {
            try {
              Player.restartCurrentEntry();
              appendLog("restartCurrentEntry() called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
    />
  );
}

export function SeekToTimeDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Seek to 30s"
          onPress={() => {
            try {
              Player.seekToTime(30);
              appendLog("seekToTime(30) called");
            } catch (e) {
              appendLog(`error: ${String(e)}`);
            }
          }}
        />
      }
      hint="Also demonstrated via the scrubber in the player bar."
    />
  );
}

export function AddListenerDemo() {
  const { appendLog } = useApp();
  useEffect(() => {
    const subs = [
      Player.addListener("onPlaybackStateChange", (state) => {
        appendLog(`event onPlaybackStateChange: ${state.playbackStatus}`);
      }),
      Player.addListener("onCurrentSongChange", (song) => {
        appendLog(`event onCurrentSongChange: ${song.title}`);
      }),
    ];
    appendLog("Listening for onPlaybackStateChange and onCurrentSongChange");
    return () => subs.forEach((s) => s.remove());
  }, [appendLog]);

  return (
    <ApiScreen hint="Events append to the log when playback changes. Queue a song to see updates.">
      <Text style={{ fontSize: 13, color: "#666" }}>
        This screen registers listeners on mount. Global onPlaybackError is
        registered in AppProvider.
      </Text>
    </ApiScreen>
  );
}
