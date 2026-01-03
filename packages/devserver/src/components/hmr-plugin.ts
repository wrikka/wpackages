import type { Plugin, HmrContext } from 'vite';

type ReloadCallback = () => void | Promise<void>;

interface HmrPlugin extends Plugin {
  onReload: (callback: ReloadCallback) => void;
}

export const createHmrPlugin = (): HmrPlugin => {
  const callbacks: ReloadCallback[] = [];

  return {
    name: 'custom-hmr',
    handleHotUpdate(_context: HmrContext): void {
      // Trigger all registered callbacks on any hot update
      callbacks.forEach(callback => callback());
    },
    onReload: (callback: ReloadCallback) => {
      callbacks.push(callback);
    },
  };
};
