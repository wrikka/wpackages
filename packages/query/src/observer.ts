import type { Query } from "./query";
import type { QueryClient } from "./client";
import type { DataLoader, QueryKey, QueryOptions, QueryState } from "./types";

export class QueryObserver<T> {
  private query: Query<T>;
  private listeners: Set<(state: QueryState<T>) => void> = new Set();
  private unsubscribeFromQuery?: () => void;

  constructor(
    private client: QueryClient,
    private key: QueryKey,
    private fetcher: DataLoader<T>,
    private options: QueryOptions<T> = {},
  ) {
    this.query = this.client.fetchQuery(this.key, this.fetcher, this.options);
    this.subscribeToQuery();
  }

  get current(): QueryState<T> {
    return this.query.current;
  }

  subscribe(listener: (state: QueryState<T>) => void): () => void {
    this.listeners.add(listener);
    listener(this.current);

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.destroy();
      }
    };
  }

  private subscribeToQuery() {
    this.unsubscribeFromQuery = this.query.subscribe((newState) => {
      for (const listener of this.listeners) {
        listener(newState);
      }
    });
  }

  destroy() {
    this.unsubscribeFromQuery?.();
    this.listeners.clear();
    // Here you might add logic to notify the QueryClient that this observer is destroyed,
    // so it can potentially garbage collect the query if no observers are left.
  }

  refetch() {
    return this.query.fetch();
  }

  invalidate() {
    this.query.invalidate();
  }

  setData(data: T) {
    this.query.setData(data);
  }
}
