import {
  Ratings,
  RatingResourceType,
  RatingValue,
  LibraryResourceType,
} from "@wwdrew/expo-apple-music";
import { ApiScreen } from "../components/ApiScreen";
import { useApp } from "../context/AppContext";
import { RunButton, SelectedSongHint } from "./helpers";

export function GetRatingDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run getRating(SONG, id)"
          disabled={!selectedSong}
          onPress={() => {
            void Ratings.getRating(RatingResourceType.SONG, selectedSong!.id)
              .then((r) =>
                appendLog(r ? `rating: ${r.value}` : "no rating set"),
              )
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function SetRatingDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run setRating(SONG, id, LIKE)"
          disabled={!selectedSong}
          onPress={() => {
            void Ratings.setRating(
              RatingResourceType.SONG,
              selectedSong!.id,
              RatingValue.LIKE,
            )
              .then((r) => appendLog(`liked ${selectedSong!.title} → ${r.value}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function ClearRatingDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run clearRating(SONG, id)"
          disabled={!selectedSong}
          onPress={() => {
            void Ratings.clearRating(RatingResourceType.SONG, selectedSong!.id)
              .then(() => appendLog(`cleared rating for ${selectedSong!.title}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function AddToFavoritesDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run addToFavorites({ songs: [id] })"
          disabled={!selectedSong}
          onPress={() => {
            void Ratings.addToFavorites({
              [LibraryResourceType.SONGS]: [selectedSong!.id],
            })
              .then(() => appendLog(`favorited ${selectedSong!.title}`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}

export function RemoveFromFavoritesDemo() {
  const { appendLog, selectedSong } = useApp();
  return (
    <ApiScreen
      actions={
        <RunButton
          title="Run removeFromFavorites({ songs: [id] })"
          disabled={!selectedSong}
          onPress={() => {
            void Ratings.removeFromFavorites({
              [LibraryResourceType.SONGS]: [selectedSong!.id],
            })
              .then(() => appendLog(`removed ${selectedSong!.title} from favorites`))
              .catch((e) => appendLog(`error: ${String(e)}`));
          }}
        />
      }
    >
      <SelectedSongHint />
    </ApiScreen>
  );
}
