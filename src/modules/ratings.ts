import type { Rating, RatingResourceType, RatingValue, ResourceIds } from '../types/rating';
import { MusicModule } from '../native-module';
import { normalizeResourceIds } from '../utils/normalize-resource-ids';

class Ratings {
  public static async getRating(
    resourceType: RatingResourceType,
    id: string,
  ): Promise<Rating | null> {
    const result = await MusicModule.getRating(resourceType, id);
    return (result as Rating | null) ?? null;
  }

  public static async setRating(
    resourceType: RatingResourceType,
    id: string,
    value: RatingValue,
  ): Promise<Rating> {
    return (await MusicModule.setRating(resourceType, id, value)) as Rating;
  }

  public static async clearRating(resourceType: RatingResourceType, id: string): Promise<void> {
    await MusicModule.clearRating(resourceType, id);
  }

  public static async addToFavorites(resourceIds: ResourceIds): Promise<void> {
    await MusicModule.addToFavorites(normalizeResourceIds(resourceIds));
  }

  public static async removeFromFavorites(resourceIds: ResourceIds): Promise<void> {
    await MusicModule.removeFromFavorites(normalizeResourceIds(resourceIds));
  }
}

export default Ratings;
