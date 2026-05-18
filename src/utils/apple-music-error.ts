export type AppleMusicError = {
  code: string;
  message: string;
  operation?: string;
};

export function isAppleMusicError(error: unknown): error is AppleMusicError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AppleMusicError).code === 'string' &&
    typeof (error as AppleMusicError).message === 'string'
  );
}
