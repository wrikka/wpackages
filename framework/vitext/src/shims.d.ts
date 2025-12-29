declare module "@wpackages/devserver" {
  export type DevServerInstance = any;
  export const createDevServer: any;
}

declare module "@wpackages/watch" {
  export type WatchEvent = any;
  export type WatchError = any;
  export type WatcherInstance = any;
  export const watch: any;
}

declare module "@wpackages/cache" {
  export const createCache: any;
  export const memoize: any;
}

declare module "@wpackages/functional" {
  export const ok: any;
  export const err: any;
}
