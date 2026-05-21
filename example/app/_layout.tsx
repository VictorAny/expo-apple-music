import { AppleMusic } from "@wwdrew/expo-apple-music";
import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthStatusChip } from "../components/AuthStatusChip";
import { fetchExampleDeveloperToken } from "../lib/apple-music-developer-token";
import { GlobalLogDrawer } from "../components/GlobalLogDrawer";
import { HeaderLogButton } from "../components/HeaderLogButton";
import { PlayerBar } from "../components/PlayerBar";
import { AppProvider } from "../context/AppContext";
import { theme } from "../lib/theme";

AppleMusic.configure({
  getDeveloperToken: fetchExampleDeveloperToken,
});

function headerRight() {
  return (
    <View style={styles.headerRight}>
      <AuthStatusChip />
      <HeaderLogButton />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <View style={styles.root}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.card },
              headerTintColor: theme.accent,
              contentStyle: { backgroundColor: theme.bg },
              headerRight,
            }}
          >
            <Stack.Screen
              name="index"
              options={{ title: "API Explorer", headerRight: () => <HeaderLogButton /> }}
            />
            <Stack.Screen name="playground" options={{ title: "Playground" }} />
            <Stack.Screen name="[module]/index" />
            <Stack.Screen
              name="[module]/[method]"
              options={({ route }) => {
                const params = route.params as {
                  module?: string;
                  method?: string;
                };
                return {
                  title: params.method ?? "Demo",
                  headerBackTitle: params.module ?? "Back",
                };
              }}
            />
          </Stack>
          <GlobalLogDrawer />
          <PlayerBar />
        </View>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headerRight: { flexDirection: "row", alignItems: "center" },
});
