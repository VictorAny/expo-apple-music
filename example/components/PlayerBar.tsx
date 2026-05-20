import {
  Player,
  useCurrentSong,
  useIsPlaying,
  usePlaybackState,
} from "@wwdrew/expo-apple-music";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "../context/AppContext";
import { formatApiError } from "../lib/format-error";

export function PlayerBar() {
  const { appendLog } = useApp();
  const onPlaybackError = (message: string) => appendLog(`player: ${message}`);
  const insets = useSafeAreaInsets();
  const { song } = useCurrentSong();
  const { isPlaying } = useIsPlaying();
  const { playbackTime, playbackStatus } = usePlaybackState();

  const durationSec = durationToSeconds(song?.duration);
  const progress =
    durationSec > 0
      ? Math.min(1, Math.max(0, playbackTime / durationSec))
      : 0;
  const [scrubRatio, setScrubRatio] = useState<number | null>(null);
  const displayProgress = scrubRatio ?? progress;
  const displayTime =
    scrubRatio != null && durationSec > 0
      ? scrubRatio * durationSec
      : playbackTime;

  const runControl = useCallback(
    (action: () => void) => {
      try {
        action();
      } catch (error) {
        onPlaybackError?.(formatApiError(error));
      }
    },
    [onPlaybackError],
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {song ? (
        <View style={styles.nowPlaying}>
          {song.artworkUrl ? (
            <Image source={{ uri: song.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]} />
          )}
          <View style={styles.meta}>
            <Text style={styles.title} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {song.artistName}
            </Text>
            <Text style={styles.status}>{playbackStatus}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.empty}>Queue a song to use the player</Text>
      )}

      <SeekableProgress
        progress={displayProgress}
        disabled={!song || durationSec <= 0}
        onScrub={setScrubRatio}
        onSeek={(ratio) => {
          setScrubRatio(null);
          Player.seekToTime(ratio * durationSec);
        }}
      />

      <View style={styles.times}>
        <Text style={styles.time}>{formatTime(displayTime)}</Text>
        <Text style={styles.time}>
          {durationSec > 0 ? formatTime(durationSec) : "—"}
        </Text>
      </View>

      <View style={styles.controls}>
        <ControlButton
          label="⏮"
          accessibilityLabel="Previous"
          onPress={() => runControl(() => Player.skipToPreviousEntry())}
        />
        <ControlButton
          label={isPlaying ? "⏸" : "▶"}
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
          primary
          onPress={() => runControl(() => Player.togglePlayerState())}
        />
        <ControlButton
          label="⏭"
          accessibilityLabel="Next"
          onPress={() => runControl(() => Player.skipToNextEntry())}
        />
      </View>
    </View>
  );
}

function SeekableProgress({
  progress,
  disabled,
  onScrub,
  onSeek,
}: {
  progress: number;
  disabled: boolean;
  onScrub: (ratio: number | null) => void;
  onSeek: (ratio: number) => void;
}) {
  const trackRef = useRef<View>(null);
  const trackWidth = useRef(0);
  const trackPageX = useRef(0);

  const ratioFromPageX = useCallback((pageX: number) => {
    if (trackWidth.current <= 0) return 0;
    return Math.min(
      1,
      Math.max(0, (pageX - trackPageX.current) / trackWidth.current),
    );
  }, []);

  const updateTrackMetrics = useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, width) => {
      trackPageX.current = x;
      trackWidth.current = width;
    });
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (evt) => {
          onScrub(ratioFromPageX(evt.nativeEvent.pageX));
        },
        onPanResponderMove: (evt) => {
          onScrub(ratioFromPageX(evt.nativeEvent.pageX));
        },
        onPanResponderRelease: (evt) => {
          onSeek(ratioFromPageX(evt.nativeEvent.pageX));
        },
        onPanResponderTerminate: () => {
          onScrub(null);
        },
      }),
    [disabled, onScrub, onSeek, ratioFromPageX],
  );

  return (
    <View
      ref={trackRef}
      onLayout={updateTrackMetrics}
      {...panResponder.panHandlers}
      style={[
        styles.progressHitArea,
        disabled && styles.progressDisabled,
      ]}
    >
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { flex: progress }]} />
        <View style={{ flex: 1 - progress }} />
        <View
          style={[
            styles.progressThumb,
            { left: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

function ControlButton({
  label,
  accessibilityLabel,
  primary,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        primary && styles.controlButtonPrimary,
        pressed && styles.controlButtonPressed,
      ]}
    >
      <Text style={[styles.controlLabel, primary && styles.controlLabelPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function durationToSeconds(duration: number | string | undefined): number {
  if (duration == null) return 0;
  const raw = typeof duration === "string" ? Number(duration) : duration;
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw > 1000 ? raw / 1000 : raw;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSec = Math.floor(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  nowPlaying: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#e8e8e8",
  },
  artworkPlaceholder: {
    backgroundColor: "#ddd",
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  status: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textTransform: "capitalize",
  },
  empty: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
    textAlign: "center",
  },
  progressHitArea: {
    paddingVertical: 10,
    marginVertical: -6,
  },
  progressTrack: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    overflow: "visible",
  },
  progressFill: {
    backgroundColor: "#007aff",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -5,
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: 7,
    backgroundColor: "#007aff",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressDisabled: {
    opacity: 0.5,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: "#666",
    fontVariant: ["tabular-nums"],
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 4,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  controlButtonPrimary: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#007aff",
  },
  controlButtonPressed: {
    opacity: 0.75,
  },
  controlLabel: {
    fontSize: 20,
    color: "#222",
  },
  controlLabelPrimary: {
    fontSize: 22,
    color: "#fff",
  },
});
