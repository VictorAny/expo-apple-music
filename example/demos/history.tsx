import {
  History,
  type RecentResource,
  type Song,
  type Station,
} from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { formatApiError } from "../lib/format-error";
import { requireMusicToken } from "../lib/require-music-token";
import { toDemoItems } from "../lib/demo-list";
import { RunButton } from "./helpers";

export function GetRecentlyPlayedResourcesDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [items, setItems] = useState<
    { id: string | number; title: string; type: string; subtitle: string }[]
  >([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getRecentlyPlayedResources()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getRecentlyPlayedResources(musicUserToken)
              .then((r) => {
                setItems(r.recentlyPlayedItems);
                appendLog(`${r.recentlyPlayedItems.length} resource(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        items.map((item) => ({
          key: String(item.id),
          title: item.title,
          subtitle: `${item.type} · ${item.subtitle}`,
        })),
      )}
    />
  );
}

export function GetRecentlyPlayedTracksDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [songs, setSongs] = useState<Song[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getRecentlyPlayedTracks()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getRecentlyPlayedTracks(musicUserToken, { limit: 10 })
              .then((r) => {
                setSongs(r.songs);
                appendLog(`${r.songs.length} track(s)`);
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
        })),
      )}
    />
  );
}

export function GetHeavyRotationDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [items, setItems] = useState<RecentResource[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getHeavyRotation()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getHeavyRotation(musicUserToken, { limit: 10 })
              .then((r) => {
                setItems(r.items);
                appendLog(`${r.items.length} resource(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        items.map((item) => ({
          key: String(item.id),
          title: item.title,
          subtitle: item.subtitle,
        })),
      )}
    />
  );
}

export function GetRecentlyPlayedStationsDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [stations, setStations] = useState<Station[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getRecentlyPlayedStations()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getRecentlyPlayedStations(musicUserToken, { limit: 10 })
              .then((r) => {
                setStations(r.stations);
                appendLog(`${r.stations.length} station(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        stations.map((s) => ({
          key: s.id,
          title: s.name,
          meta: `id: ${s.id}`,
        })),
      )}
    />
  );
}

export function GetRecentlyAddedDemo() {
  const { musicUserToken, appendLog } = useApp();
  const [items, setItems] = useState<RecentResource[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getRecentlyAdded()"
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void History.getRecentlyAdded(musicUserToken, { limit: 10 })
              .then((r) => {
                setItems(r.items);
                appendLog(`${r.items.length} resource(s)`);
              })
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(
        items.map((item) => ({
          key: String(item.id),
          title: item.title,
          subtitle: item.subtitle,
        })),
      )}
    />
  );
}
