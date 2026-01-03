import { describe, it, expect, mock, beforeAll } from 'bun:test';
import { createBrowserHistory } from '../src/createBrowserHistory';

beforeAll(() => {
  global.window = {
    history: {
      pushState: mock(() => {}),
      replaceState: mock(() => {}),
      back: mock(() => {}),
      go: mock(() => {}),
      state: null,
    },
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
    addEventListener: mock(() => {}),
    removeEventListener: mock(() => {}),
  } as any;
});

describe('createBrowserHistory', () => {
  it('should handle push', () => {
    const history = createBrowserHistory();
    history.push('/test');
    expect(window.location.pathname).toBe('/test');
  });

  it('should handle replace', () => {
    const history = createBrowserHistory();
    history.push('/initial');
    history.replace('/replaced');
    expect(window.location.pathname).toBe('/replaced');
  });

  it('should notify listeners on popstate', (done) => {
    const history = createBrowserHistory();
    const listener = mock((location, action) => {
      expect(location.pathname).toBe('/');
      expect(action).toBe('POP');
      done();
    });

    history.listen(listener);
    history.push('/foo');
    window.history.back();
  });
});
