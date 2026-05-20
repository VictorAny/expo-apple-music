import { ItemRow } from "../components/ItemRow";
import type { DemoListItem } from "../components/DemoScreen";

type RowSpec = {
  key: string;
  title: string;
  subtitle?: string;
  meta?: string;
  selected?: boolean;
  onPress?: () => void;
};

export function toDemoItems(rows: RowSpec[]): DemoListItem[] {
  return rows.map((row) => ({
    key: row.key,
    node: (
      <ItemRow
        title={row.title}
        subtitle={row.subtitle}
        meta={row.meta}
        selected={row.selected}
        onPress={row.onPress}
      />
    ),
  }));
}
