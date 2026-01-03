import { describe, it, expect } from 'vitest';
import { Effect, Either } from 'effect';
import { tryPromise, AppError, mapError, fromEither } from './index';

describe('tryPromise', () => {
  it('should return a successful Effect with the correct value when the promise resolves', async () => {
    const successFn = () => Promise.resolve('success');
    const effect = tryPromise(successFn);
    const result = await Effect.runPromise(effect);
    expect(result).toBe('success');
  });

  it('should return a failed Effect with an AppError when the promise rejects', async () => {
    const error = new Error('Something went wrong');
    const failureFn = () => Promise.reject(error);
    const effect = tryPromise(failureFn, 400);

    const result = await Effect.runPromise(Effect.flip(effect));

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe(String(error));
    expect(result.statusCode).toBe(400);
  });

  it('should handle synchronous functions that return a value', async () => {
    const syncFn = () => 'sync success';
    const effect = tryPromise(syncFn);
    const result = await Effect.runPromise(effect);
    expect(result).toBe('sync success');
  });

  it('should handle synchronous functions that throw an error', async () => {
    const error = new Error('Sync error');
    const syncThrowFn = () => {
      throw error;
    };
    const effect = tryPromise(syncThrowFn, 500);
    const result = await Effect.runPromise(Effect.flip(effect));

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe(String(error));
    expect(result.statusCode).toBe(500);
  });
});

describe('mapError', () => {
  it('should map a failed Effect to a new AppError', async () => {
    const originalError = new Error('Original');
    const effect = Effect.fail(originalError);
    const mappedEffect = mapError(
      effect,
      (e) => new AppError({ message: `Mapped: ${e.message}`, statusCode: 418 }),
    );

    const result = await Effect.runPromise(Effect.flip(mappedEffect));

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Mapped: Original');
    expect(result.statusCode).toBe(418);
  });

  it('should not affect a successful Effect', async () => {
    const effect = Effect.succeed('Still good');
    const mappedEffect = mapError(
      effect,
      () => new AppError({ message: 'Should not happen', statusCode: 500 }),
    );

    const result = await Effect.runPromise(mappedEffect);
    expect(result).toBe('Still good');
  });
});

describe('fromEither', () => {
  it('should create a successful Effect from a Right', async () => {
    const either = Either.right('Success value');
    const effect = fromEither(either);
    const result = await Effect.runPromise(effect);
    expect(result).toBe('Success value');
  });

  it('should create a failed Effect with an AppError from a Left', async () => {
    const either = Either.left('Failure reason');
    const effect = fromEither(either, 404);
    const result = await Effect.runPromise(Effect.flip(effect));

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe('Failure reason');
    expect(result.statusCode).toBe(404);
  });
});
