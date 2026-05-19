import {
  History,
  type RecentResource,
  type Song,
  type Station,
} from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { ItemRow } from "../components/ItemRow";
import { useApp } from "../context/AppContext";
import { RunButton } from "./helpers";

export function GetRecentlyPlayedResourcesDemo() {
  const { appendLog } = useApp();
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
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {items.map((item) => (
        <ItemRow
          key={String(item.id)}
          title={item.title}
          subtitle={`${item.type} · ${item.subtitle}`}
        />
      ))}
    </ApiScreen>
  );
}

export function GetRecentlyPlayedTracksDemo() {
  const { appendLog } = useApp();
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
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {songs.map((s) => (
        <ItemRow key={s.id} title={s.title} subtitle={s.artistName} />
      ))}
    </ApiScreen>
  );
}

export function GetHeavyRotationDemo() {
  const { appendLog } = useApp();
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
                appendLog(`${r.items.length} item(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {items.map((item) => (
        <ItemRow
          key={item.id}
          title={item.title}
          subtitle={`${item.type} · ${item.subtitle}`}
        />
      ))}
    </ApiScreen>
  );
}

export function GetRecentlyPlayedStationsDemo() {
  const { appendLog } = useApp();
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
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {stations.map((s) => (
        <ItemRow key={s.id} title={s.name} meta={`id: ${s.id}`} />
      ))}
    </ApiScreen>
  );
}

export function GetRecentlyAddedDemo() {
  const { appendLog } = useApp();
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
                appendLog(`${r.items.length} item(s)`);
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      {items.map((item) => (
        <ItemRow
          key={item.id}
          title={item.title}
          subtitle={`${item.type} · ${item.subtitle}`}
        />
      ))}
    </ApiScreen>
  );
}
