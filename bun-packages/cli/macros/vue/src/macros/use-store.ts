export function useStore<T>(_name: string): {
  getState(): T;
  setState(state: Partial<T>): void;
} {
  return {
    getState: () => ({} as T),
    setState: () => {},
  };
}
