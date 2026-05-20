/**
 * Reference mapper for Apple Music API JSON — mirrors {@link AppleMusicJsonMapper.kt}.
 * Used by fixture tests; native code remains the runtime source of truth.
 */

export interface AppleMusicApiResource {
  id?: string;
  type?: string;
  attributes?: Record<string, unknown>;
}

function artworkUrl(artwork: Record<string, unknown> | undefined, width = 200, height = 200): string {
  const template = artwork?.url;
  if (typeof template !== 'string' || !template) {
    return '';
  }
  return template.replace('{w}', String(width)).replace('{h}', String(height));
}

function durationMillis(attributes: Record<string, unknown>): number {
  if (typeof attributes.durationInMillis === 'number') {
    return attributes.durationInMillis;
  }
  if (typeof attributes.duration === 'number') {
    return Math.floor(attributes.duration * 1000);
  }
  return 0;
}

function catalogPlaybackId(resource: AppleMusicApiResource): string | undefined {
  const playParams = resource.attributes?.playParams as Record<string, unknown> | undefined;
  if (!playParams) {
    return undefined;
  }
  if (typeof playParams.id === 'string' && playParams.id) {
    return playParams.id;
  }
  if (typeof playParams.catalogId === 'string' && playParams.catalogId) {
    return playParams.catalogId;
  }
  return undefined;
}

export function mapSong(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const id = catalogPlaybackId(resource) ?? resource.id ?? '';
  return {
    id,
    title: String(attributes.name ?? ''),
    artistName: String(attributes.artistName ?? ''),
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
    duration: durationMillis(attributes),
  };
}

export function mapAlbum(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  return {
    id: resource.id ?? '',
    title: String(attributes.name ?? ''),
    artistName: String(attributes.artistName ?? ''),
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
    trackCount: Number(attributes.trackCount ?? 0),
  };
}

export function mapArtist(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  return {
    id: resource.id ?? '',
    name: String(attributes.name ?? ''),
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
  };
}

export function mapPlaylist(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const description = attributes.description;
  const descriptionText =
    typeof description === 'string'
      ? description
      : typeof description === 'object' && description !== null && 'standard' in description
        ? String((description as { standard?: string }).standard ?? '')
        : '';
  return {
    id: resource.id ?? '',
    name: String(attributes.name ?? ''),
    description: descriptionText,
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
    trackCount: Number(attributes.trackCount ?? 0),
  };
}

export function mapRecentResource(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const apiType = resource.type ?? '';
  const itemType = apiType.includes('album')
    ? 'album'
    : apiType.includes('playlist')
      ? 'playlist'
      : apiType.includes('station')
        ? 'station'
        : 'unknown';
  const subtitle =
    String(attributes.artistName ?? '').trim() ||
    String(attributes.curatorName ?? '').trim() ||
    (typeof attributes.description === 'object' &&
    attributes.description !== null &&
    'standard' in attributes.description
      ? String((attributes.description as { standard?: string }).standard ?? '')
      : '');
  return {
    id: resource.id ?? '',
    title: String(attributes.name ?? ''),
    subtitle,
    type: itemType,
  };
}

export function mapRecentlyPlayed(resource: AppleMusicApiResource) {
  return mapRecentResource(resource);
}

export function mapStation(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  return {
    id: resource.id ?? '',
    name: String(attributes.name ?? ''),
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
  };
}

export function mapMusicVideo(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const id = catalogPlaybackId(resource) ?? resource.id ?? '';
  return {
    id,
    title: String(attributes.name ?? ''),
    artistName: String(attributes.artistName ?? ''),
    artworkUrl: artworkUrl(attributes.artwork as Record<string, unknown> | undefined),
    duration: durationMillis(attributes),
  };
}

export function mapRecommendation(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const titleObj = attributes.title as { stringForDisplay?: string } | undefined;
  const resourceTypes: string[] = [];
  const types = attributes.resourceTypes;
  if (Array.isArray(types)) {
    for (const entry of types) {
      resourceTypes.push(String(entry));
    }
  }
  const contents = mapRecommendationContents(resource);
  return {
    id: resource.id ?? '',
    title: String(titleObj?.stringForDisplay ?? ''),
    resourceTypes,
    playlists: contents.playlists,
    albums: contents.albums,
    stations: contents.stations,
  };
}

function mapRecommendationContents(resource: AppleMusicApiResource) {
  const playlists: ReturnType<typeof mapPlaylist>[] = [];
  const albums: ReturnType<typeof mapAlbum>[] = [];
  const stations: ReturnType<typeof mapStation>[] = [];
  const relationships = resource as AppleMusicApiResource & {
    relationships?: { contents?: { data?: AppleMusicApiResource[] } };
  };
  const data = relationships.relationships?.contents?.data;
  if (!data) {
    return { playlists, albums, stations };
  }
  for (const item of data) {
    const type = item.type ?? '';
    if (type.includes('playlist')) {
      playlists.push(mapPlaylist(item));
    } else if (type.includes('album')) {
      albums.push(mapAlbum(item));
    } else if (type.includes('station')) {
      stations.push(mapStation(item));
    }
  }
  return { playlists, albums, stations };
}

/** Maps `GET/PUT /v1/me/ratings/...` envelope — same shape on iOS REST, Android, and web. */
export function mapRating(
  response: { data?: AppleMusicApiResource[] },
): { id: string; value: number } | null {
  const first = response.data?.[0];
  if (!first) {
    return null;
  }
  const attributes = first.attributes ?? {};
  const raw = attributes.value;
  const value =
    typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN;
  if (Number.isNaN(value)) {
    return null;
  }
  return {
    id: first.id ?? '',
    value,
  };
}

export function mapReplaySummary(resource: AppleMusicApiResource) {
  const attributes = resource.attributes ?? {};
  const topSongs = mapRelationshipResources(resource, 'top-songs', mapSong);
  const topAlbums = mapRelationshipResources(resource, 'top-albums', mapAlbum);
  const topArtists = mapRelationshipResources(resource, 'top-artists', mapArtist);
  const result: Record<string, unknown> = {
    id: resource.id ?? '',
    type: resource.type ?? '',
    name: String(attributes.name ?? ''),
    topSongs,
    topAlbums,
    topArtists,
  };
  if (attributes.year !== undefined) {
    result.year = Number(attributes.year);
  }
  return result;
}

function mapRelationshipResources<T>(
  resource: AppleMusicApiResource,
  relationshipKey: string,
  mapper: (item: AppleMusicApiResource) => T,
): T[] {
  const relationships = resource as AppleMusicApiResource & {
    relationships?: Record<string, { data?: AppleMusicApiResource[] }>;
  };
  const data = relationships.relationships?.[relationshipKey]?.data;
  if (!data) {
    return [];
  }
  return data.map(mapper);
}

export { catalogPlaybackId };
