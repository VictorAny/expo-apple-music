import { Library, type Album, type Artist, type Playlist, type Song } from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { ItemRow } from "../components/ItemRow";
import { useApp } from "../context/AppContext";
import { RunButton } from "./helpers";

export function GetPlaylistsDemo() {
  const { appendLog, setLastPlaylistId } = useApp();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getPlaylists()"
          onPress={() => {
            void Library.getPlaylists({ limit: 10 })
              .then((r) => {
                setPlaylists(r.playlists);
                if (r.playlists[0]) setLastPlaylistId(r.playlists[0].id);
                appendLog(`${r.playlists.length} playlist(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {playlists.map((p) => (
        <ItemRow
          key={p.id}
          title={p.name}
          meta={`id: ${p.id}`}
          onPress={() => setLastPlaylistId(p.id)}
        />
      ))}
    </ApiScreen>
  );
}

export function GetSongsDemo() {
  const { appendLog } = useApp();
  const [songs, setSongs] = useState<Song[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getSongs()"
          onPress={() => {
            void Library.getSongs({ limit: 10 })
              .then((r) => {
                setSongs(r.songs);
                appendLog(`${r.songs.length} library song(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {songs.map((s) => (
        <ItemRow key={s.id} title={s.title} subtitle={s.artistName} meta={`id: ${s.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetPlaylistTracksDemo() {
  const { appendLog, lastPlaylistId } = useApp();
  const [tracks, setTracks] = useState<Song[]>([]);
  return (
    <ApiScreen
      hint="Run getPlaylists first and tap a playlist to select its id."
      actions={
        <RunButton
          title="Run getPlaylistTracks(playlistId)"
          disabled={!lastPlaylistId}
          onPress={() => {
            void Library.getPlaylistTracks(lastPlaylistId!, { limit: 25 })
              .then((r) => {
                setTracks(r.songs);
                appendLog(`${r.songs.length} track(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {tracks.map((t) => (
        <ItemRow key={t.id} title={t.title} subtitle={t.artistName} />
      ))}
    </ApiScreen>
  );
}

export function GetArtistsDemo() {
  const { appendLog } = useApp();
  const [artists, setArtists] = useState<Artist[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getArtists()"
          onPress={() => {
            void Library.getArtists({ limit: 10 })
              .then((r) => {
                setArtists(r.artists);
                appendLog(`${r.artists.length} library artist(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {artists.map((a) => (
        <ItemRow key={a.id} title={a.name} meta={`id: ${a.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetAlbumsDemo() {
  const { appendLog } = useApp();
  const [albums, setAlbums] = useState<Album[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getAlbums()"
          onPress={() => {
            void Library.getAlbums({ limit: 10 })
              .then((r) => {
                setAlbums(r.albums);
                appendLog(`${r.albums.length} library album(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {albums.map((a) => (
        <ItemRow key={a.id} title={a.title} subtitle={a.artistName} meta={`id: ${a.id}`} />
      ))}
    </ApiScreen>
  );
}
