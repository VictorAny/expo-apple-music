import type { AppleMusicError } from '../utils/apple-music-error';
import { isAppleMusicError } from '../utils/apple-music-error';

export async function callNative<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw normalizeNativeError(operation, error);
  }
}

export function normalizeNativeError(operation: string, error: unknown): AppleMusicError {
  if (isAppleMusicError(error)) {
    return error.operation ? error : { ...error, operation };
  }

  const coded = error as { code?: unknown; message?: unknown };
  if (typeof coded.code === 'string' && typeof coded.message === 'string') {
    return { code: coded.code, message: coded.message, operation };
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown Apple Music error';

  return { code: 'ERROR', message, operation };
}

export function invalidLibraryIdError(label: string, id: string): AppleMusicError {
  return {
    code: 'INVALID_LIBRARY_ID',
    message: `Expected a library resource id (i., l., or p. prefix) for ${label}, got "${id}"`,
  };
}
