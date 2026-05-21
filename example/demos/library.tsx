import { Library, type Album, type Artist, type Playlist, type Song } from "@wwdrew/expo-apple-music";
import { useEffect, useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { IdField } from "../components/IdField";
import { useApp } from "../context/AppContext";
import { toDemoItems } from "../lib/demo-list";
import { formatApiError } from "../lib/format-error";
import { requireMusicToken } from "../lib/require-music-token";
import { RunButton } from "./helpers";

export function GetPlaylistsDemo() {
  const { musicUserToken, appendLog, setLastPlaylistId } = useApp();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getPlaylists()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getPlaylists(musicUserToken, { limit: 10 })
              .then((r) => {
                setPlaylists(r.playlists);
                if (r.playlists[0]) setLastPlaylistId(r.playlists[0].id);
                appendLog(`${r.playlists.length} playlist(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        playlists.map((p) => ({
          key: p.id,
          title: p.name,
          meta: `id: ${p.id}`,
          onPress: () => setLastPlaylistId(p.id),
        })),
      )}
    />
  );
}

export function GetSongsDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [songs, setSongs] = useState<Song[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getSongs()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getSongs(musicUserToken, { limit: 10 })
              .then((r) => {
                setSongs(r.songs);
                appendLog(`${r.songs.length} library song(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        songs.map((s) => ({
          key: s.id,
          title: s.title,
          subtitle: s.artistName,
          meta: `id: ${s.id}`,
        })),
      )}
    />
  );
}

export function GetPlaylistTracksDemo() {
  const { musicUserToken, appendLog, lastPlaylistId } = useApp();
  const [playlistId, setPlaylistId] = useState(lastPlaylistId ?? "");
  const [tracks, setTracks] = useState<Song[]>([]);
  useEffect(() => {
    if (!playlistId && lastPlaylistId) setPlaylistId(lastPlaylistId);
  }, [lastPlaylistId, playlistId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField
          label="Playlist id"
          value={playlistId}
          onChangeText={setPlaylistId}
          hint="Run getPlaylists and tap a playlist, or paste an id."
        />
      }
      actions={
        <RunButton
          title="Run getPlaylistTracks(playlistId)"
          disabled={!playlistId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getPlaylistTracks(musicUserToken, playlistId.trim(), { limit: 25 })
              .then((r) => {
                setTracks(r.songs);
                appendLog(`${r.songs.length} track(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        tracks.map((t) => ({
          key: t.id,
          title: t.title,
          subtitle: t.artistName,
        })),
      )}
    />
  );
}

export function GetArtistsDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [artists, setArtists] = useState<Artist[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getArtists()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getArtists(musicUserToken, { limit: 10 })
              .then((r) => {
                setArtists(r.artists);
                appendLog(`${r.artists.length} library artist(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        artists.map((a) => ({
          key: a.id,
          title: a.name,
          meta: `id: ${a.id}`,
        })),
      )}
    />
  );
}

export function GetAlbumsDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [albums, setAlbums] = useState<Album[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getAlbums()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Library.getAlbums(musicUserToken, { limit: 10 })
              .then((r) => {
                setAlbums(r.albums);
                appendLog(`${r.albums.length} library album(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        albums.map((a) => ({
          key: a.id,
          title: a.title,
          subtitle: a.artistName,
          meta: `id: ${a.id}`,
        })),
      )}
    />
  );
}
