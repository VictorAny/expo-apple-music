import { callNative } from '../api/call-native';
import { requireMusicUserToken } from '../api/require-music-user-token';
import type { Rating, RatingResourceType, RatingValue, ResourceIds } from '../types/rating';
import { MusicModule } from '../native-module';
import { normalizeResourceIds } from '../utils/normalize-resource-ids';

class Ratings {
  public static async getRating(
    musicUserToken: string,
    resourceType: RatingResourceType,
    id: string,
  ): Promise<Rating | null> {
    requireMusicUserToken(musicUserToken, 'Ratings.getRating');
    return callNative('Ratings.getRating', async () => {
      const result = await MusicModule.getRating(musicUserToken, resourceType, id);
      return (result as Rating | null) ?? null;
    });
  }

  public static async setRating(
    musicUserToken: string,
    resourceType: RatingResourceType,
    id: string,
    value: RatingValue,
  ): Promise<Rating> {
    requireMusicUserToken(musicUserToken, 'Ratings.setRating');
    return callNative('Ratings.setRating', async () =>
      (await MusicModule.setRating(musicUserToken, resourceType, id, value)) as Rating,
    );
  }

  public static async clearRating(
    musicUserToken: string,
    resourceType: RatingResourceType,
    id: string,
  ): Promise<void> {
    requireMusicUserToken(musicUserToken, 'Ratings.clearRating');
    await callNative('Ratings.clearRating', async () => {
      await MusicModule.clearRating(musicUserToken, resourceType, id);
    });
  }

  public static async addToFavorites(musicUserToken: string, resourceIds: ResourceIds): Promise<void> {
    requireMusicUserToken(musicUserToken, 'Ratings.addToFavorites');
    await callNative('Ratings.addToFavorites', async () => {
      await MusicModule.addToFavorites(musicUserToken, normalizeResourceIds(resourceIds));
    });
  }

  public static async removeFromFavorites(
    musicUserToken: string,
    resourceIds: ResourceIds,
  ): Promise<void> {
    requireMusicUserToken(musicUserToken, 'Ratings.removeFromFavorites');
    await callNative('Ratings.removeFromFavorites', async () => {
      await MusicModule.removeFromFavorites(musicUserToken, normalizeResourceIds(resourceIds));
    });
  }
}

export default Ratings;
