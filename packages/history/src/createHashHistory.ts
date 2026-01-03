import { History } from './types';
import { createHistory } from './history';
import { createHashSource } from './sources/hash';

export function createHashHistory(): History {
  return createHistory(createHashSource());
}
