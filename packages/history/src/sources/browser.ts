import { Action, Location } from '../types';
import { HistorySource } from '../history';
import { createMockSource } from './mock';
import { createKey, createPath, parsePath } from '../utils';

const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.history !== 'undefined' &&
  typeof window.location !== 'undefined';

export function createBrowserSource(): HistorySource {
  if (!isBrowser) {
    return createMockSource();
  }
  const globalHistory = window.history;

  function getLocation(): Location {
    const { pathname, search, hash } = window.location;
    return {
      pathname,
      search,
      hash,
      state: globalHistory.state,
      key: (globalHistory.state as { key?: string })?.key || 'default',
    };
  }

  let location = getLocation();
  let action: Action = 'POP';

  return {
    get location() {
      return location;
    },
    get action() {
      return action;
    },
    push(path: string, state?: unknown) {
      action = 'PUSH';
      const newLocation = parsePath(path);
      const key = createKey();
      globalHistory.pushState({ key, state }, '', createPath(newLocation));
      location = { ...newLocation, state, key };
      (window.location as any).pathname = newLocation.pathname;
      (window.location as any).search = newLocation.search;
      (window.location as any).hash = newLocation.hash;
    },
    replace(path: string, state?: unknown) {
      action = 'REPLACE';
      const newLocation = parsePath(path);
      const key = createKey();
      globalHistory.replaceState({ key, state }, '', createPath(newLocation));
      location = { ...newLocation, state, key };
      (window.location as any).pathname = newLocation.pathname;
      (window.location as any).search = newLocation.search;
      (window.location as any).hash = newLocation.hash;
    },
    go(delta: number) {
      globalHistory.go(delta);
    },
    listen(listener) {
      const handlePopState = () => {
        action = 'POP';
        location = getLocation();
        listener(location, action);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    },
  };
}
