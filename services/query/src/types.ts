export type LoadingState = "idle" | "loading" | "success" | "error";

export interface QueryOptions<T = unknown> {
  initialData?: T;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number | ((attempt: number) => number);
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  onSettled?: (data: T | undefined, error: unknown) => void;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnMount?: boolean;
}

export interface QueryState<T> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  status: LoadingState;
  lastUpdated: number | null;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  storage?: "memory" | "localStorage" | "sessionStorage";
}

export interface RetryOptions {
  count: number;
  delay: number | ((attempt: number) => number);
  shouldRetry?: (error: unknown) => boolean;
}

export interface MutationOptions<TData, TVariables, TError = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | undefined, variables: TVariables) => void;
  retry?: number;
  retryDelay?: number | ((attempt: number) => number);
}

export interface MutationState<TData, TVariables, TError = unknown> {
  data: TData | undefined;
  error: TError | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
  status: LoadingState;
  variables: TVariables | undefined;
}

export interface DataLoader<T> {
  (): Promise<T>;
}

export interface KeyGenerator {
  (...args: unknown[]): string;
}
