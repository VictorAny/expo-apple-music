import { Auth } from "@wwdrew/expo-apple-music";
import { formatApiError } from "../lib/format-error";
import { Platform } from "react-native";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { RunButton } from "./helpers";

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
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run checkSubscription()"
          requiresAuth={false}
          onPress={() => {
            void Auth.checkSubscription()
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
  const { appendLog } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getStorefront()"
          requiresAuth={false}
          onPress={() => {
            void Auth.getStorefront()
              .then((sf) => appendLog(`storefront.id: ${sf.id}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}
