import { Auth } from "@wwdrew/expo-apple-music";
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
          onPress={() => {
            void Auth.checkSubscription()
              .then((sub) =>
                appendLog(
                  `canPlayCatalogContent: ${sub.canPlayCatalogContent}, ` +
                    `hasCloudLibraryEnabled: ${sub.hasCloudLibraryEnabled}`,
                ),
              )
              .catch((e) => appendLog(`error: ${String(e)}`));
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
          onPress={() => {
            void Auth.getStorefront()
              .then((sf) => appendLog(`storefront.id: ${sf.id}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    />
  );
}
