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
import { formatApiError as fe from "../lib/format-error";
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
            void History.getRecentlyPlayedResources()
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
            void History.getRecentlyPlayedTracks({ limit: 10 })
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
            void History.getHeavyRotation({ limit: 10 })
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
            void History.getRecentlyPlayedStations({ limit: 10 })
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
            void History.getRecentlyAdded({ limit: 10 })
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
