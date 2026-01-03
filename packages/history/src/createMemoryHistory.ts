import { History } from './types';
import { createHistory } from './history';
import { createMemorySource } from './sources/memory';

export function createMemoryHistory(initialEntries: string[] = ['/']): History {
  return createHistory(createMemorySource(initialEntries));
}
