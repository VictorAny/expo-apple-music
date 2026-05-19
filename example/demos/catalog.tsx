import {
  Catalog,
  CatalogChartType,
  CatalogSearchType,
  MusicItem,
  Player,
  type Album,
} from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { ItemRow } from "../components/ItemRow";
import { useApp } from "../context/AppContext";
import { formatDuration } from "../lib/format";
import { NeedSearchHint, RunButton, SelectedSongHint } from "./helpers";

export function SearchDemo() {
  const {
    appendLog,
    setCatalogSongs,
    setCatalogAlbums,
    setCatalogArtists,
    setCatalogPlaylists,
    setSelectedSongId,
    catalogSongs,
    catalogAlbums,
    catalogArtists,
  } = useApp();

  async function runSearch() {
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
      setCatalogSongs(result.songs);
      setCatalogAlbums(result.albums);
      setCatalogArtists(result.artists);
      setCatalogPlaylists(result.playlists);
      if (result.songs[0]) setSelectedSongId(result.songs[0].id);
      appendLog(
        `songs: ${result.songs.length}, albums: ${result.albums.length}, ` +
          `artists: ${result.artists.length}, playlists: ${result.playlists.length}`,
      );
    } catch (e) {
      appendLog(`error: ${String(e)}`);
    }
  }

  return (
    <ApiScreen
      actions={<RunButton title='Search "Beatles"' onPress={() => void runSearch()} />}
    >
      {catalogSongs.map((song) => (
        <ItemRow
          key={song.id}
          title={song.title}
          subtitle={song.artistName}
          meta={`id: ${song.id} · ${formatDuration(song.duration)}`}
        />
      ))}
      {catalogAlbums.map((album) => (
        <ItemRow
          key={album.id}
          title={album.title}
          subtitle={album.artistName}
          meta={`id: ${album.id}`}
        />
      ))}
      {catalogArtists.map((artist) => (
        <ItemRow key={artist.id} title={artist.name} meta={`id: ${artist.id}`} />
      ))}
    </ApiScreen>
  );
}

function useCatalogIds() {
  const { catalogSongs, catalogAlbums, catalogArtists, catalogPlaylists } =
    useApp();
  return {
    songId: catalogSongs[0]?.id,
    albumId: catalogAlbums[0]?.id,
    artistId: catalogArtists[0]?.id,
    playlistId: catalogPlaylists[0]?.id,
  };
}

export function GetSongDemo() {
  const { appendLog } = useApp();
  const { songId } = useCatalogIds();
  return (
    <ApiScreen
      hint={!songId ? "Needs a song id from search." : undefined}
      actions={
        <RunButton
          title="Run getSong(id)"
          disabled={!songId}
          onPress={() => {
            void Catalog.getSong(songId!)
              .then((s) => appendLog(`${s.title} — ${s.artistName}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function GetAlbumDemo() {
  const { appendLog } = useApp();
  const { albumId } = useCatalogIds();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getAlbum(id)"
          disabled={!albumId}
          onPress={() => {
            void Catalog.getAlbum(albumId!)
              .then((a) => appendLog(`${a.title} — ${a.trackCount} tracks`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!albumId ? <NeedSearchHint /> : null}
    </ApiScreen>
  );
}

export function GetArtistDemo() {
  const { appendLog } = useApp();
  const { artistId } = useCatalogIds();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getArtist(id)"
          disabled={!artistId}
          onPress={() => {
            void Catalog.getArtist(artistId!)
              .then((a) => appendLog(`artist: ${a.name}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!artistId ? <NeedSearchHint /> : null}
    </ApiScreen>
  );
}

export function GetPlaylistDemo() {
  const { appendLog, catalogPlaylists } = useApp();
  const playlist = catalogPlaylists[0];
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getPlaylist(id)"
          disabled={!playlist}
          onPress={() => {
            void Catalog.getPlaylist(playlist!.id)
              .then((p) => appendLog(`playlist: ${p.name}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!playlist ? <NeedSearchHint /> : null}
    </ApiScreen>
  );
}

export function GetStationDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      hint="Catalog.search does not return stations. Supply a catalog station id in your own app."
      actions={
        <RunButton
          title="Run getStation (example id)"
          onPress={() => {
            appendLog("Provide a station id from Apple Music catalog URLs or API docs.");
          }}
        />
      }
    />
  );
}

export function GetMusicVideoDemo() {
  const { appendLog } = useApp();
  const { songId } = useCatalogIds();
  return (
    <ApiScreen
      hint="Use a music video catalog id. Song ids from search will not work."
      actions={
        <RunButton
          title="Run getMusicVideo(id)"
          disabled={!songId}
          onPress={() => {
            void Catalog.getMusicVideo(songId!)
              .then((v) => appendLog(`video: ${v.title}`))
              .catch((e) => appendLog(`error: ${String(e)} (expected if id is a song)`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function GetAlbumTracksDemo() {
  const { appendLog } = useApp();
  const { albumId } = useCatalogIds();
  const [tracks, setTracks] = useState<{ id: string; title: string }[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getAlbumTracks(albumId)"
          disabled={!albumId}
          onPress={() => {
            void Catalog.getAlbumTracks(albumId!, { limit: 25 })
              .then((r) => {
                setTracks(r.songs.map((s) => ({ id: s.id, title: s.title })));
                appendLog(`${r.songs.length} track(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!albumId ? <NeedSearchHint /> : null}
      {tracks.map((t) => (
        <ItemRow key={t.id} title={t.title} meta={`id: ${t.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetArtistAlbumsDemo() {
  const { appendLog, catalogArtists } = useApp();
  const { artistId } = useCatalogIds();
  const artist = catalogArtists[0];
  const [albums, setAlbums] = useState<Album[]>([]);

  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getArtistAlbums(artistId)"
          disabled={!artistId}
          onPress={() => {
            void Catalog.getArtistAlbums(artistId!, { limit: 10 })
              .then((r) => {
                setAlbums(r.albums);
                appendLog(`${r.albums.length} album(s) for ${artist?.name ?? artistId}`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!artistId ? <NeedSearchHint /> : null}
      {albums.map((a) => (
        <ItemRow key={a.id} title={a.title} meta={`id: ${a.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetPlaylistTracksDemo() {
  const { appendLog, catalogPlaylists } = useApp();
  const playlist = catalogPlaylists[0];
  const [tracks, setTracks] = useState<{ id: string; title: string }[]>([]);

  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getPlaylistTracks(playlistId)"
          disabled={!playlist}
          onPress={() => {
            void Catalog.getPlaylistTracks(playlist!.id, { limit: 25 })
              .then((r) => {
                setTracks(r.songs.map((s) => ({ id: s.id, title: s.title })));
                appendLog(`${r.songs.length} track(s) in ${playlist!.name}`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {!playlist ? <NeedSearchHint /> : null}
      {tracks.map((t) => (
        <ItemRow key={t.id} title={t.title} meta={`id: ${t.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetChartsDemo() {
  const {
    appendLog,
    setCatalogSongs,
    setCatalogAlbums,
    catalogSongs,
    catalogAlbums,
  } = useApp();

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
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {catalogSongs.slice(0, 5).map((s) => (
        <ItemRow key={s.id} title={s.title} subtitle={s.artistName} />
      ))}
      {catalogAlbums.slice(0, 5).map((a) => (
        <ItemRow key={a.id} title={a.title} subtitle={a.artistName} />
      ))}
    </ApiScreen>
  );
}

export async function playCatalogSong(
  songId: string,
  appendLog: (m: string) => void,
) {
  await Player.configurePlayer(false);
  await Player.setQueue(songId, MusicItem.SONG);
  const state = await Player.getCurrentState();
  appendLog(`queue song — status: ${state.playbackStatus}`);
}

export async function playCatalogAlbum(
  albumId: string,
  appendLog: (m: string) => void,
) {
  await Player.configurePlayer(false);
  await Player.setQueue(albumId, MusicItem.ALBUM);
  const state = await Player.getCurrentState();
  appendLog(`queue album — status: ${state.playbackStatus}`);
}
