import { getErrorMessage } from "@wwdrew/expo-apple-music";

/** Format bridge/API rejections for example logs. Do not use `String(error)` — it yields `[object Object]`. */
export const formatApiError = getErrorMessage;
