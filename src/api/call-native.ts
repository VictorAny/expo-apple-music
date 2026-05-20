import { AppleMusicErrorCode } from '../constants/apple-music-error-codes';
import type { AppleMusicError } from '../utils/apple-music-error';
import { asThrownAppleMusicError, isAppleMusicError } from '../utils/apple-music-error';

export async function callNative<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw asThrownAppleMusicError(normalizeNativeError(operation, error));
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

  return { code: AppleMusicErrorCode.error, message, operation };
}

export function invalidLibraryIdError(label: string, id: string): AppleMusicError {
  return {
    code: AppleMusicErrorCode.invalidLibraryId,
    message: `Expected a library resource id (i., l., or p. prefix) for ${label}, got "${id}"`,
  };
}

export function throwInvalidLibraryIdError(label: string, id: string): never {
  throw asThrownAppleMusicError(invalidLibraryIdError(label, id));
}
