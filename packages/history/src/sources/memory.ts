import { Action, Location } from '../types';
import { HistorySource } from '../history';
import { createKey, parsePath } from '../utils';

export function createMemorySource(initialEntries: string[] = ['/']): HistorySource {
  const normalizedInitialEntries = initialEntries.length > 0 ? initialEntries : ['/'];
  let entries = normalizedInitialEntries.map(entry => parsePath(entry));
  let index = entries.length - 1;
  let location: Location = { ...entries[index], state: null, key: 'default' };
  let action: Action = 'POP';
  let listeners: ((location: Location, action: Action) => void)[] = [];

  return {
    get location() {
      return location;
    },
    get action() {
      return action;
    },
    push(path: string, state?: unknown) {
      action = 'PUSH';
      index++;
      entries.splice(index, entries.length - index, parsePath(path));
      location = { ...entries[index], state, key: createKey() };
      listeners.forEach(listener => listener(location, action));
    },
    replace(path: string, state?: unknown) {
      action = 'REPLACE';
      entries[index] = parsePath(path);
      location = { ...entries[index], state, key: createKey() };
      listeners.forEach(listener => listener(location, action));
    },
    go(delta: number) {
      const newIndex = index + delta;
      if (newIndex < 0 || newIndex >= entries.length) {
        return;
      }
      action = 'POP';
      index = newIndex;
      location = { ...entries[index], state: null, key: 'default' };
      listeners.forEach(listener => listener(location, action));
    },
    listen(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
  };
}
