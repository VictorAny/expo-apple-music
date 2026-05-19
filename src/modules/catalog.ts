import type { CatalogSearchType, ICatalogSearch } from '../types/catalog-search';
import type { IPaginationOptions } from '../types/pagination';
import MusicKit from './music-kit';

class Catalog {
  public static async search(
    term: string,
    types: CatalogSearchType[],
    options?: IPaginationOptions,
  ): Promise<ICatalogSearch> {
    return MusicKit.catalogSearch(term, types, options);
  }
}

export default Catalog;
