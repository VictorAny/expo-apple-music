import { isAppleMusicError } from './apple-music-error';

export const getErrorMessage = (error: unknown, fallback = 'Unknown error'): string => {
  if (isAppleMusicError(error)) {
    const prefix = error.code && error.code !== 'ERROR' ? `${error.code}: ` : '';
    const operation = error.operation ? ` (${error.operation})` : '';
    return `${prefix}${error.message}${operation}`;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  const e = error as { message?: string };
  if (typeof e?.message === 'string' && e.message.trim().length > 0) {
    return e.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return fallback;
};
