import {
  Catalog,
  CatalogChartType,
  MusicItem,
  type Album,
} from "@wwdrew/expo-apple-music";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { ApiScreen } from "../components/ApiScreen";
import { CatalogSearchField } from "../components/CatalogSearchField";
import { IdField } from "../components/IdField";
import { useApp } from "../context/AppContext";
import { toDemoItems } from "../lib/demo-list";
import { formatApiError } from "../lib/format-error";
import { formatDuration } from "../lib/format";
import { queueAndPlay } from "../lib/playback";
import { RunButton } from "./helpers";

export function SearchDemo() {
  const {
    catalogSongs,
    catalogAlbums,
    catalogArtists,
    catalogPlaylists,
    devToken,
  } = useApp();

  const items = useMemo(
    () =>
      toDemoItems([
        ...catalogSongs.map((song) => ({
          key: `song-${song.id}`,
          title: song.title,
          subtitle: song.artistName,
          meta: `id: ${song.id} · ${formatDuration(song.duration)}`,
        })),
        ...catalogAlbums.map((album) => ({
          key: `album-${album.id}`,
          title: album.title,
          subtitle: album.artistName,
          meta: `id: ${album.id}`,
        })),
        ...catalogArtists.map((artist) => ({
          key: `artist-${artist.id}`,
          title: artist.name,
          meta: `id: ${artist.id}`,
        })),
        ...catalogPlaylists.map((playlist) => ({
          key: `playlist-${playlist.id}`,
          title: playlist.name,
          meta: `id: ${playlist.id}`,
        })),
      ]),
    [catalogAlbums, catalogArtists, catalogPlaylists, catalogSongs],
  );

  return (
    <ApiScreen
      headerExtra={<CatalogSearchField limit={5} />}
      hint={
        Platform.OS === "android" && !devToken?.trim()
          ? "Android needs a developer JWT — pass it to Auth.authorize (see docs/AUTH.md)."
          : undefined
      }
      items={items}
    />
  );
}

function useIdField(defaultValue = "") {
  const [value, setValue] = useState(defaultValue);
  return { value, setValue };
}

export function GetSongDemo() {
  const { appendLog, catalogSongs } = useApp();
  const { value: songId, setValue: setSongId } = useIdField(catalogSongs[0]?.id ?? "");
  useEffect(() => {
    if (!songId && catalogSongs[0]?.id) setSongId(catalogSongs[0].id);
  }, [catalogSongs, songId, setSongId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run getSong(id)"
          disabled={!songId.trim()}
          onPress={() => {
            void Catalog.getSong(songId.trim())
              .then((s) => appendLog(`${s.title} — ${s.artistName}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetAlbumDemo() {
  const { appendLog, catalogAlbums } = useApp();
  const { value: albumId, setValue: setAlbumId } = useIdField(catalogAlbums[0]?.id ?? "");
  useEffect(() => {
    if (!albumId && catalogAlbums[0]?.id) setAlbumId(catalogAlbums[0].id);
  }, [albumId, catalogAlbums, setAlbumId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Album id" value={albumId} onChangeText={setAlbumId} />
      }
      actions={
        <RunButton
          title="Run getAlbum(id)"
          disabled={!albumId.trim()}
          onPress={() => {
            void Catalog.getAlbum(albumId.trim())
              .then((a) => appendLog(`${a.title} — ${a.trackCount} tracks`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetArtistDemo() {
  const { appendLog, catalogArtists } = useApp();
  const { value: artistId, setValue: setArtistId } = useIdField(
    catalogArtists[0]?.id ?? "",
  );
  useEffect(() => {
    if (!artistId && catalogArtists[0]?.id) setArtistId(catalogArtists[0].id);
  }, [artistId, catalogArtists, setArtistId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Artist id" value={artistId} onChangeText={setArtistId} />
      }
      actions={
        <RunButton
          title="Run getArtist(id)"
          disabled={!artistId.trim()}
          onPress={() => {
            void Catalog.getArtist(artistId.trim())
              .then((a) => appendLog(`artist: ${a.name}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetPlaylistDemo() {
  const { appendLog, catalogPlaylists } = useApp();
  const { value: playlistId, setValue: setPlaylistId } = useIdField(
    catalogPlaylists[0]?.id ?? "",
  );
  useEffect(() => {
    if (!playlistId && catalogPlaylists[0]?.id) setPlaylistId(catalogPlaylists[0].id);
  }, [catalogPlaylists, playlistId, setPlaylistId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Playlist id" value={playlistId} onChangeText={setPlaylistId} />
      }
      actions={
        <RunButton
          title="Run getPlaylist(id)"
          disabled={!playlistId.trim()}
          onPress={() => {
            void Catalog.getPlaylist(playlistId.trim())
              .then((p) => appendLog(`playlist: ${p.name}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetStationDemo() {
  const { appendLog } = useApp();
  const { value: stationId, setValue: setStationId } = useIdField();
  return (
    <ApiScreen
      hint="Catalog.search does not return stations. Paste a catalog station id."
      headerExtra={
        <IdField label="Station id" value={stationId} onChangeText={setStationId} />
      }
      actions={
        <RunButton
          title="Run getStation(id)"
          disabled={!stationId.trim()}
          onPress={() => {
            void Catalog.getStation(stationId.trim())
              .then((s) => appendLog(`station: ${s.name}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetMusicVideoDemo() {
  const { appendLog } = useApp();
  const { value: videoId, setValue: setVideoId } = useIdField();
  return (
    <ApiScreen
      hint="Use a music video catalog id — song ids from search will not work."
      headerExtra={
        <IdField label="Music video id" value={videoId} onChangeText={setVideoId} />
      }
      actions={
        <RunButton
          title="Run getMusicVideo(id)"
          disabled={!videoId.trim()}
          onPress={() => {
            void Catalog.getMusicVideo(videoId.trim())
              .then((v) => appendLog(`video: ${v.title}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetAlbumTracksDemo() {
  const { appendLog, catalogAlbums } = useApp();
  const { value: albumId, setValue: setAlbumId } = useIdField(catalogAlbums[0]?.id ?? "");
  const [tracks, setTracks] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    if (!albumId && catalogAlbums[0]?.id) setAlbumId(catalogAlbums[0].id);
  }, [albumId, catalogAlbums, setAlbumId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Album id" value={albumId} onChangeText={setAlbumId} />
      }
      actions={
        <RunButton
          title="Run getAlbumTracks(albumId)"
          disabled={!albumId.trim()}
          onPress={() => {
            void Catalog.getAlbumTracks(albumId.trim(), { limit: 25 })
              .then((r) => {
                setTracks(r.songs.map((s) => ({ id: s.id, title: s.title })));
                appendLog(`${r.songs.length} track(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        tracks.map((t) => ({ key: t.id, title: t.title, meta: `id: ${t.id}` })),
      )}
    />
  );
}

export function GetArtistAlbumsDemo() {
  const { appendLog, catalogArtists } = useApp();
  const { value: artistId, setValue: setArtistId } = useIdField(
    catalogArtists[0]?.id ?? "",
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    if (!artistId && catalogArtists[0]?.id) setArtistId(catalogArtists[0].id);
  }, [artistId, catalogArtists, setArtistId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Artist id" value={artistId} onChangeText={setArtistId} />
      }
      actions={
        <RunButton
          title="Run getArtistAlbums(artistId)"
          disabled={!artistId.trim()}
          onPress={() => {
            void Catalog.getArtistAlbums(artistId.trim(), { limit: 10 })
              .then((r) => {
                setAlbums(r.albums);
                appendLog(`${r.albums.length} album(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        albums.map((a) => ({ key: a.id, title: a.title, meta: `id: ${a.id}` })),
      )}
    />
  );
}

export function GetPlaylistTracksDemo() {
  const { appendLog, catalogPlaylists } = useApp();
  const { value: playlistId, setValue: setPlaylistId } = useIdField(
    catalogPlaylists[0]?.id ?? "",
  );
  const [tracks, setTracks] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    if (!playlistId && catalogPlaylists[0]?.id) setPlaylistId(catalogPlaylists[0].id);
  }, [catalogPlaylists, playlistId, setPlaylistId]);

  return (
    <ApiScreen
      headerExtra={
        <IdField label="Playlist id" value={playlistId} onChangeText={setPlaylistId} />
      }
      actions={
        <RunButton
          title="Run getPlaylistTracks(playlistId)"
          disabled={!playlistId.trim()}
          onPress={() => {
            void Catalog.getPlaylistTracks(playlistId.trim(), { limit: 25 })
              .then((r) => {
                setTracks(r.songs.map((s) => ({ id: s.id, title: s.title })));
                appendLog(`${r.songs.length} track(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        tracks.map((t) => ({ key: t.id, title: t.title, meta: `id: ${t.id}` })),
      )}
    />
  );
}

export function GetChartsDemo() {
  const { appendLog, setCatalogSongs, setCatalogAlbums, catalogSongs, catalogAlbums } =
    useApp();

  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getCharts([SONGS, ALBUMS])"
          onPress={() => {
            void Catalog.getCharts(
              [CatalogChartType.SONGS, CatalogChartType.ALBUMS],
              { limit: 10 },
            )
              .then((charts) => {
                setCatalogSongs(charts.songs);
                setCatalogAlbums(charts.albums);
                appendLog(
                  `${charts.songs.length} songs, ${charts.albums.length} albums`,
                );
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems([
        ...catalogSongs.slice(0, 5).map((s) => ({
          key: `chart-song-${s.id}`,
          title: s.title,
          subtitle: s.artistName,
        })),
        ...catalogAlbums.slice(0, 5).map((a) => ({
          key: `chart-album-${a.id}`,
          title: a.title,
          subtitle: a.artistName,
        })),
      ])}
    />
  );
}

export async function playCatalogSong(
  songId: string,
  appendLog: (m: string) => void,
) {
  await queueAndPlay(songId, MusicItem.SONG, appendLog);
}

export async function playCatalogAlbum(
  albumId: string,
  appendLog: (m: string) => void,
) {
  await queueAndPlay(albumId, MusicItem.ALBUM, appendLog);
}
