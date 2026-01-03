// Core types
type Listener<T> = (value: T, oldValue?: T) => void;
type Unsubscribe = () => void;

interface Store<T> {
  get(): T;
  set(value: T): void;
  subscribe(listener: Listener<T>): Unsubscribe;
  listen(listener: Listener<T>): Unsubscribe;
}

// Atom: for primitive values
export function atom<T>(initialValue: T): Store<T> {
  let value = initialValue;
  const listeners = new Set<Listener<T>>();

  const store: Store<T> & { onMount?: any, onUnmount?: any } = {
    get: () => value,
    set: (newValue: T) => {
      if (newValue === value) return;
      const oldValue = value;
      value = newValue;
      listeners.forEach(l => l(value, oldValue));
    },
    subscribe: (listener: Listener<T>) => {
      listeners.add(listener);
      manageLifecycle(store, listeners);
      listener(value);
      return () => {
        listeners.delete(listener);
        manageLifecycle(store, listeners);
      };
    },
    listen: (listener: Listener<T>) => {
      listeners.add(listener);
      manageLifecycle(store, listeners);
      return () => {
        listeners.delete(listener);
        manageLifecycle(store, listeners);
      };
    },
  };
  return store;
}

// --- Map Store ---
type MapListener<T extends object> = (value: T, oldValue?: T, changedKey?: keyof T) => void;

interface MapStore<T extends object> {
  get(): T;
  set(value: T): void;
  setKey<K extends keyof T>(key: K, value: T[K]): void;
  subscribe(listener: MapListener<T>): Unsubscribe;
  listen(listener: MapListener<T>): Unsubscribe;
}

export function map<T extends object>(initialValue: T): MapStore<T> {
  let value = { ...initialValue };
  const listeners = new Set<MapListener<T>>();

  const notify = (oldValue: T, changedKey?: keyof T) => {
    listeners.forEach(l => l(value, oldValue, changedKey));
  };

  const store: MapStore<T> & { onMount?: any, onUnmount?: any } = {
    get: () => value,
    set: (newValue: T) => {
      const oldValue = value;
      value = newValue;
      notify(oldValue);
    },
    setKey: <K extends keyof T>(key: K, newValue: T[K]) => {
      if (value[key] === newValue) return;
      const oldValue = { ...value };
      value[key] = newValue;
      notify(oldValue, key);
    },
    subscribe: (listener: MapListener<T>) => {
      listeners.add(listener);
      manageLifecycle(store, listeners);
      listener(value);
      return () => {
        listeners.delete(listener);
        manageLifecycle(store, listeners);
      };
    },
    listen: (listener: MapListener<T>) => {
      listeners.add(listener);
      manageLifecycle(store, listeners);
      return () => {
        listeners.delete(listener);
        manageLifecycle(store, listeners);
      };
    },
  };
  return store;
}

// --- Computed Store ---
interface ReadonlyStore<T> {
    get(): T;
    subscribe(listener: Listener<T>): Unsubscribe;
    listen(listener: Listener<T>): Unsubscribe;
}

export function computed<T, D extends any[]>(
  stores: [...{ [K in keyof D]: Store<D[K]> | ReadonlyStore<D[K]> }],
  computer: (...values: D) => T
): ReadonlyStore<T> {
  const derived = atom(computer(...stores.map(s => s.get()) as D));

  // TODO: This should also use onMount to be truly lazy
  stores.forEach(store => {
    store.listen(() => {
      derived.set(computer(...stores.map(s => s.get()) as D));
    });
  });

  return {
    get: derived.get,
    subscribe: derived.subscribe,
    listen: derived.listen,
  };
}

// --- Lifecycle ---
const activeStores = new Set<any>();

function manageLifecycle(store: any, listeners: Set<any>) {
    if (listeners.size > 0 && !activeStores.has(store)) {
        activeStores.add(store);
        if (store.onMount) {
            store.onUnmount = store.onMount();
        }
    } else if (listeners.size === 0 && activeStores.has(store)) {
        activeStores.delete(store);
        if (store.onUnmount) {
            store.onUnmount();
            store.onUnmount = undefined;
        }
    }
}

export function onMount<T>(store: Store<T> | MapStore<T>, onMountCallback: () => (() => void) | void) {
  (store as any).onMount = onMountCallback;
}
