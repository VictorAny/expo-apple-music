import { Auth } from "@wwdrew/expo-apple-music";
import { formatApiError } from "../lib/format-error";
import { Platform } from "react-native";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { requireMusicToken } from "../lib/require-music-token";
import { RunButton } from "./helpers";

export function SetDeveloperTokenDemo() {
  const { devToken, appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run setDeveloperToken()"
          onPress={() => {
            if (!devToken?.trim()) {
              appendLog(
                "Set EXPO_PUBLIC_APPLE_MUSIC_DEVELOPER_TOKEN in example/.env.local (see docs/CLI.md)",
              );
              return;
            }
            void Auth.setDeveloperToken(devToken)
              .then(() => appendLog("setDeveloperToken: stored on native/web"))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
          requiresAuth={false}
        />
      }
    />
  );
}

export function AuthorizeDemo() {
  const { authorize, devToken, hasStoredSession } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title={hasStoredSession ? "Re-authorize" : "Run authorize()"}
          onPress={() => void authorize()}
          disabled={Platform.OS === "android" && !devToken}
          requiresAuth={false}
        />
      }
    />
  );
}

export function CheckSubscriptionDemo() {
  const { musicUserToken, appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run checkSubscription()"
          requiresAuth={false}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Auth.checkSubscription(musicUserToken)
              .then((sub) =>
                appendLog(
                  `canPlayCatalogContent: ${sub.canPlayCatalogContent}, ` +
                    `hasCloudLibraryEnabled: ${sub.hasCloudLibraryEnabled}`,
                ),
              )
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function GetStorefrontDemo() {
  const { musicUserToken, appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getStorefront()"
          requiresAuth={false}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Auth.getStorefront(musicUserToken)
              .then((sf) => appendLog(`storefront.id: ${sf.id}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}
