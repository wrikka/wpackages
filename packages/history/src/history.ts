import { Action, History, Listener, Location } from './types';

export interface HistorySource {
  readonly location: Location;
  readonly action: Action;
  push(path: string, state?: unknown): void;
  replace(path: string, state?: unknown): void;
  go(delta: number): void;
  listen(listener: (location: Location, action: Action) => void): () => void;
}

export function createHistory(source: HistorySource): History {
  let listeners: Listener[] = [];
  let sourceUnlisten: (() => void) | null = null;

  function listen(listener: Listener): () => void {
    if (listeners.length === 0) {
      sourceUnlisten = source.listen((location, action) => {
        listeners.forEach(l => l(location, action));
      });
    }

    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);

      if (listeners.length === 0 && sourceUnlisten) {
        sourceUnlisten();
        sourceUnlisten = null;
      }
    };
  }

  return {
    get location() {
      return source.location;
    },
    get action() {
      return source.action;
    },
    push: source.push,
    replace: source.replace,
    go: source.go,
    back: () => source.go(-1),
    forward: () => source.go(1),
    listen,
  };
}

