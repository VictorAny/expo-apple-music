import { Recommendations } from "@wwdrew/expo-apple-music";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { toDemoItems } from "../lib/demo-list";
import { RunButton } from "./helpers";

export function GetRecommendationsDemo() {
  const { appendLog } = useApp();
  const [titles, setTitles] = useState<string[]>([]);
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run get()"
          onPress={() => {
            void Recommendations.get()
              .then((r) => {
                setTitles(r.recommendations.map((g) => g.title));
                const first = r.recommendations[0];
                appendLog(
                  `${r.recommendations.length} group(s)` +
                    (first
                      ? ` — "${first.title}" (${first.playlists.length} playlists)`
                      : ""),
                );
              })
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
      items={toDemoItems(titles.map((t, index) => ({ key: `${t}-${index}`, title: t })))}
    />
  );
}

export function GetReplayDemo() {
  const { appendLog } = useApp();
  return (
    <ApiScreen
      hint="May 404 for ineligible accounts or years without enough listening history."
      actions={
        <RunButton
          title="Run getReplay({ year: 2024 })"
          onPress={() => {
            void Recommendations.getReplay({ year: 2024 })
              .then((r) => appendLog(`replay summaries: ${r.summaries.length}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}
