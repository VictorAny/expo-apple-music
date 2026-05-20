export type AppleMusicError = {
  code: string;
  message: string;
  operation?: string;
};

export type AppleMusicErrorInstance = Error & AppleMusicError;

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

/** Throw shape for bridge rejections — `instanceof Error` and readable `String(error)`. */
export function asThrownAppleMusicError(error: AppleMusicError): AppleMusicErrorInstance {
  return Object.assign(new Error(error.message), error);
}
