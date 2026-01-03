import { Action, Location } from '../types';
import { HistorySource } from '../history';
import { createMockSource } from './mock';
import { parsePath } from '../utils';

const isBrowser =
  typeof window !== 'undefined' &&
  typeof window.location !== 'undefined' &&
  typeof window.history !== 'undefined';

export function createHashSource(): HistorySource {
  if (!isBrowser) {
    return createMockSource();
  }
  function getLocation(): Location {
    const path = window.location.hash.substring(1);
    const { pathname, search, hash } = parsePath(path);
    return {
      pathname: pathname || '/',
      search: search || '',
      hash: hash || '',
      state: null, // Hash history doesn't support state
      key: 'default',
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
    push(path: string, _state?: unknown) {
      action = 'PUSH';
      const nextHash = path.startsWith('#') ? path : `#${path}`;
      window.location.hash = nextHash;
    },
    replace(path: string, _state?: unknown) {
      action = 'REPLACE';
      const i = window.location.href.indexOf('#');
      window.location.replace(
        window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
      );
    },
    go(delta: number) {
      window.history.go(delta);
    },
    listen(listener) {
      const handleHashChange = () => {
        action = 'POP';
        location = getLocation();
        listener(location, action);
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    },
  };
}
