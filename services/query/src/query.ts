import type { DataLoader, QueryOptions, QueryState } from "./types";
import { Cache } from "./cache";

export class Query<T = unknown> {
  private state: QueryState<T>;
  private options: {
    initialData: T | undefined;
    staleTime: number;
    cacheTime: number;
    retry: number;
    retryDelay: number | ((attempt: number) => number);
    onSuccess?: (data: T) => void;
    onError?: (error: unknown) => void;
    onSettled?: (data: T | undefined, error: unknown) => void;
    refetchOnWindowFocus: boolean;
    refetchOnReconnect: boolean;
    refetchOnMount: boolean;
  };
  private cache: Cache<T>;
  private abortController: AbortController | null = null;
  private listeners: Set<(state: QueryState<T>) => void> = new Set();

  constructor(
    private key: string,
    private fetcher: DataLoader<T>,
    options: QueryOptions<T> = {},
  ) {
    this.options = {
      initialData: options.initialData,
      staleTime: options.staleTime ?? 0,
      cacheTime: options.cacheTime ?? 5 * 60 * 1000,
      retry: options.retry ?? 0,
      retryDelay: options.retryDelay ?? 1000,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onSettled: options.onSettled,
      refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
      refetchOnReconnect: options.refetchOnReconnect ?? false,
      refetchOnMount: options.refetchOnMount ?? true,
    };

    this.cache = new Cache({ defaultTTL: this.options.cacheTime });

    this.state = {
      data: this.options.initialData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: false,
      status: "idle",
      lastUpdated: null,
    };

    // Setup event listeners for refetch
    if (this.options.refetchOnWindowFocus) {
      this.setupWindowFocusListener();
    }

    if (this.options.refetchOnReconnect) {
      this.setupReconnectListener();
    }

    // Auto-fetch on mount
    if (this.options.refetchOnMount) {
      this.fetch();
    }
  }

  get current(): QueryState<T> {
    return { ...this.state };
  }

  subscribe(listener: (state: QueryState<T>) => void): () => void {
    this.listeners.add(listener);
    listener(this.current);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async fetch(): Promise<T> {
    // Check cache first
    const cached = this.cache.get(this.key);
    if (cached !== undefined && !this.isStale()) {
      this.updateState({
        data: cached,
        isLoading: false,
        isFetching: false,
        isError: false,
        isSuccess: true,
        status: "success",
        lastUpdated: Date.now(),
      });
      return cached;
    }

    // Abort previous request
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();

    this.updateState({
      isLoading: this.state.data === undefined,
      isFetching: true,
      status: "loading",
    });

    let lastError: unknown;
    let attempt = 0;
    const maxAttempts = this.options.retry + 1;

    while (attempt < maxAttempts) {
      try {
        const data = await this.executeFetch(this.abortController.signal);

        // Cache the result
        this.cache.set(this.key, data);

        this.updateState({
          data,
          error: undefined,
          isLoading: false,
          isFetching: false,
          isError: false,
          isSuccess: true,
          status: "success",
          lastUpdated: Date.now(),
        });

        this.options.onSuccess?.(data);
        this.options.onSettled?.(data, undefined);

        return data;
      } catch (error) {
        lastError = error;
        attempt++;

        if (attempt < maxAttempts) {
          const delay = typeof this.options.retryDelay === "function"
            ? this.options.retryDelay(attempt)
            : this.options.retryDelay;

          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    this.updateState({
      error: lastError,
      isLoading: false,
      isFetching: false,
      isError: true,
      isSuccess: false,
      status: "error",
      lastUpdated: Date.now(),
    });

    this.options.onError?.(lastError);
    this.options.onSettled?.(undefined, lastError);

    throw lastError;
  }

  async mutate(mutator: (data: T | undefined) => T | Promise<T>): Promise<T> {
    const prevData = this.state.data;

    try {
      const newData = await mutator(prevData);

      this.updateState({
        data: newData,
        lastUpdated: Date.now(),
      });

      this.cache.set(this.key, newData);

      return newData;
    } catch (error) {
      this.updateState({
        error,
        isError: true,
        status: "error",
      });

      throw error;
    }
  }

  invalidate(): void {
    this.cache.delete(this.key);
    this.fetch();
  }

  reset(): void {
    this.cache.delete(this.key);
    this.updateState({
      data: this.options.initialData,
      error: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: false,
      status: "idle",
      lastUpdated: null,
    });
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.updateState({
      isLoading: false,
      isFetching: false,
      status: this.state.data !== undefined ? "success" : "idle",
    });
  }

  setData(data: T): void {
    this.updateState({
      data,
      isSuccess: true,
      status: "success",
      lastUpdated: Date.now(),
    });

    this.cache.set(this.key, data);
  }

  setError(error: unknown): void {
    this.updateState({
      error,
      isError: true,
      status: "error",
      lastUpdated: Date.now(),
    });
  }

  private isStale(): boolean {
    if (this.state.lastUpdated === null) {
      return true;
    }

    return Date.now() - this.state.lastUpdated > this.options.staleTime;
  }

  private async executeFetch(_signal: AbortSignal): Promise<T> {
    return await this.fetcher();
  }

  private updateState(partialState: Partial<QueryState<T>>): void {
    this.state = { ...this.state, ...partialState };

    // Notify listeners
    for (const listener of this.listeners) {
      listener(this.current);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private setupWindowFocusListener(): void {
    const handler = () => {
      if (this.isStale()) {
        this.fetch();
      }
    };

    window.addEventListener("focus", handler);

    // Store cleanup function
    (this as any)._windowFocusCleanup = () => {
      window.removeEventListener("focus", handler);
    };
  }

  private setupReconnectListener(): void {
    const handler = () => {
      this.fetch();
    };

    window.addEventListener("online", handler);

    // Store cleanup function
    (this as any)._reconnectCleanup = () => {
      window.removeEventListener("online", handler);
    };
  }

  destroy(): void {
    this.cancel();
    this.listeners.clear();

    // Cleanup event listeners
    if ((this as any)._windowFocusCleanup) {
      (this as any)._windowFocusCleanup();
    }
    if ((this as any)._reconnectCleanup) {
      (this as any)._reconnectCleanup();
    }
  }
}
