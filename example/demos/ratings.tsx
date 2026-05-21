import {
  Ratings,
  RatingResourceType,
  RatingValue,
  LibraryResourceType,
} from "@wwdrew/expo-apple-music";
import { useEffect, useState } from "react";
import { ApiScreen } from "../components/ApiScreen";
import { IdField } from "../components/IdField";
import { useApp } from "../context/AppContext";
import { formatApiError } from "../lib/format-error";
import { requireMusicToken } from "../lib/require-music-token";
import { RunButton } from "./helpers";

function useSongIdField() {
  const { catalogSongs, selectedSongId } = useApp();
  const [songId, setSongId] = useState(selectedSongId ?? catalogSongs[0]?.id ?? "");
  useEffect(() => {
    if (!songId && (selectedSongId || catalogSongs[0]?.id)) {
      setSongId(selectedSongId ?? catalogSongs[0]?.id ?? "");
    }
  }, [catalogSongs, selectedSongId, songId]);
  return { songId, setSongId };
}

export function GetRatingDemo() {
  const { musicUserToken, appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run getRating(SONG, id)"
          disabled={!songId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Ratings.getRating(musicUserToken, RatingResourceType.SONG, songId.trim())
              .then((r) =>
                appendLog(r ? `rating: ${r.value}` : "no rating set"),
              )
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function SetRatingDemo() {
  const { musicUserToken, appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run setRating(SONG, id, LIKE)"
          disabled={!songId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Ratings.setRating(
              musicUserToken,
              RatingResourceType.SONG,
              songId.trim(),
              RatingValue.LIKE,
            )
              .then((r) => appendLog(`liked ${songId.trim()} → ${r.value}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function ClearRatingDemo() {
  const { musicUserToken, appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run clearRating(SONG, id)"
          disabled={!songId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Ratings.clearRating(musicUserToken, RatingResourceType.SONG, songId.trim())
              .then(() => appendLog(`cleared rating for ${songId.trim()}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function AddToFavoritesDemo() {
  const { musicUserToken, appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run addToFavorites({ songs: [id] })"
          disabled={!songId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Ratings.addToFavorites(musicUserToken, {
              [LibraryResourceType.SONGS]: [songId.trim()],
            })
              .then(() => appendLog(`favorited ${songId.trim()}`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}

export function RemoveFromFavoritesDemo() {
  const { musicUserToken, appendLog } = useApp();
  const { songId, setSongId } = useSongIdField();
  return (
    <ApiScreen
      headerExtra={
        <IdField label="Catalog song id" value={songId} onChangeText={setSongId} />
      }
      actions={
        <RunButton
          title="Run removeFromFavorites({ songs: [id] })"
          disabled={!songId.trim()}
          onPress={() => {
            if (!requireMusicToken(musicUserToken, appendLog)) return;
            void Ratings.removeFromFavorites(musicUserToken, {
              [LibraryResourceType.SONGS]: [songId.trim()],
            })
              .then(() => appendLog(`removed ${songId.trim()} from favorites`))
              .catch((e) => appendLog(`error: ${formatApiError(e)}`));
          }}
        />
      }
    />
  );
}
