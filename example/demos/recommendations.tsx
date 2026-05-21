import { Recommendations } from "@wwdrew/expo-apple-music";
import { formatApiError } from "../lib/format-error";
import { requireMusicToken } from "../lib/require-music-token";
import { formatApiError as fe from "../lib/format-error";
import { useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { toDemoItems } from "../lib/demo-list";
import { RunButton } from "./helpers";

export function GetRecommendationsDemo() {
  const { musicUserToken, appendLog } = useApp();
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
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
      items={toDemoItems(titles.map((t, index) => ({ key: `${t}-${index}`, title: t })))}
    />
  );
}

export function GetReplayDemo() {
  const { musicUserToken, appendLog } = useApp();
  return (
    <ApiScreen
      hint="Omit year for Apple's latest eligible Replay year. May 404 if the account has insufficient listening history."
      actions={
        <RunButton
          title="Run getReplay()"
          onPress={() => {
            void Recommendations.getReplay()
              .then((r) => appendLog(`replay summaries: ${r.summaries.length}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}
