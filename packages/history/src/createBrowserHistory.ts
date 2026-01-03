import { History } from './types';
import { createHistory } from './history';
import { createBrowserSource } from './sources/browser';

export function createBrowserHistory(): History {
  return createHistory(createBrowserSource());
}
