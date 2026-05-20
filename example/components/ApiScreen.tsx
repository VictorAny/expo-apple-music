import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DemoScreen, type DemoListItem } from "./DemoScreen";
import { MethodDocs } from "./MethodDocs";
import { useMethodMeta } from "../hooks/useMethodMeta";
import { theme } from "../lib/theme";

type ApiScreenProps = {
  actions?: ReactNode;
  hint?: string;
  headerExtra?: ReactNode;
  items?: DemoListItem[];
  ListEmptyComponent?: ReactNode;
  showDocs?: boolean;
};

export function ApiScreen({
  actions,
  hint,
  headerExtra,
  items = [],
  ListEmptyComponent,
  showDocs = true,
}: ApiScreenProps) {
  const { method } = useMethodMeta();

  if (!method) {
    return (
      <View style={styles.centered}>
        <Text>Unknown API method.</Text>
      </View>
    );
  }

  const header = (
    <>
      {showDocs ? <MethodDocs /> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {headerExtra}
      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </>
  );

  return (
    <DemoScreen
      header={header}
      items={items}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 12, color: theme.muted, fontStyle: "italic", marginBottom: 12 },
  actions: { gap: 8, marginBottom: 8 },
});
