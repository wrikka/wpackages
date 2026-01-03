export type Action = 'POP' | 'PUSH' | 'REPLACE';

export interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

export type Listener = (location: Location, action: Action) => void;

export interface History {
  readonly location: Location;
  readonly action: Action;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  go(delta: number): void;
  back(): void;
  forward(): void;
  listen(listener: Listener): () => void;
}
