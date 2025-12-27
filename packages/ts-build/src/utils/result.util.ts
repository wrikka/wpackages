import type { Result } from '../types/result';

export function handleServiceResult<T, E>(
  result: Result<T, E>,
  onSuccess: (value: T) => void,
  onFailure: (error: E) => void
): void {
  if (result.success) {
    onSuccess(result.value);
  } else {
    onFailure(result.error);
  }
}
