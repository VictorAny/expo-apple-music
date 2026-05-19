import type { CatalogSearch, CatalogSearchType } from '../types/catalog-search';
import type { PaginationOptions } from '../types/pagination';
import MusicKit from './music-kit';

class Catalog {
  public static async search(
    term: string,
    types: CatalogSearchType[],
    options?: PaginationOptions,
  ): Promise<CatalogSearch> {
    return MusicKit.catalogSearch(term, types, options);
  }
}

export default Catalog;
