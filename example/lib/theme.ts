import { Platform } from "react-native";

export const theme = {
  bg: "#f4f4f4",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#007aff",
  accentBg: "#f0f7ff",
  text: "#111",
  muted: "#666",
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace",
  }),
} as const;
