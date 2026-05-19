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
