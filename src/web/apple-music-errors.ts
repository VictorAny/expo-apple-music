import { CodedError } from 'expo-modules-core';

export function missingDeveloperToken(): CodedError {
  return new CodedError(
    'MISSING_DEVELOPER_TOKEN',
    'Apple Music developer token is required on web. Pass a signed JWT to Auth.authorize(token).',
  );
}

export function missingTokens(): CodedError {
  return new CodedError(
    'permissionDenied',
    'Apple Music authorization required. Call Auth.authorize() first.',
  );
}

export function permissionDenied(): CodedError {
  return new CodedError(
    'permissionDenied',
    'Apple Music authorization required or subscription needed (403)',
  );
}

export function apiError(message: string, code = 'ERROR'): CodedError {
  return new CodedError(code, message);
}

export function playlistNotFound(): CodedError {
  return new CodedError('ERROR', 'Playlist not found in library');
}

export function itemNotFound(item: string, inLibrary: boolean): CodedError {
  const source = inLibrary ? 'library' : 'catalog';
  return new CodedError('ERROR', `${item} not found in ${source}`);
}

export function unknownMediaType(type: string): CodedError {
  return new CodedError('ERROR', `Unknown media type: ${type}`);
}

export function unsupportedLibraryType(type: string): CodedError {
  return new CodedError('ERROR', `Unsupported library media type: ${type}`);
}

export function noSongsInPlaylist(): CodedError {
  return new CodedError('ERROR', 'No songs in playlist');
}
