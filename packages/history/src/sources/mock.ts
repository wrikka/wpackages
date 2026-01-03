import { HistorySource } from '../history';

export function createMockSource(): HistorySource {
  return {
    get location() {
      return { pathname: '/', search: '', hash: '', state: null, key: 'default' };
    },
    get action() {
      return 'POP';
    },
    push() {},
    replace() {},
    go() {},
    listen() {
      return () => {};
    },
  };
}
