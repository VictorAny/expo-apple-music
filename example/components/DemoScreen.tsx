import type { ReactNode } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
} from "react-native";

export type DemoListItem = {
  key: string;
  node: ReactNode;
};

type DemoScreenProps = {
  header?: ReactNode;
  items?: DemoListItem[];
  ListEmptyComponent?: ReactNode;
};

export function DemoScreen({ header, items = [], ListEmptyComponent }: DemoScreenProps) {
  const renderItem: ListRenderItem<DemoListItem> = ({ item }) => (
    <View style={styles.row}>{item.node}</View>
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      ListHeaderComponent={header ? <View style={styles.header}>{header}</View> : null}
      ListEmptyComponent={
        ListEmptyComponent ? () => <>{ListEmptyComponent}</> : undefined
      }
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  header: { marginBottom: 8 },
  row: { marginBottom: 0 },
});
