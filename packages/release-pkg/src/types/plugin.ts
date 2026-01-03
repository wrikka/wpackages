import type { ReleaseOptions, ReleaseResult } from ".";

/**
 * Represents the execution context passed through the release pipeline.
 * It holds the current state, configuration, and services.
 */
export interface ReleaseContext {
  options: ReleaseOptions;
  result: Partial<ReleaseResult>;
  services: {
    // Define service types later
    [key: string]: any;
  };
  // A shared state bag for plugins to pass data
  state: Map<string | symbol, any>;
}

/**
 * Defines the lifecycle hooks available in the release process.
 */
export type ReleaseHook = 
  | 'start'
  | 'before:validate'
  | 'after:validate'
  | 'before:bumpVersion'
  | 'after:bumpVersion'
  | 'before:changelog'
  | 'after:changelog'
  | 'before:gitCommit'
  | 'after:gitCommit'
  | 'before:gitTag'
  | 'after:gitTag'
  | 'before:gitPush'
  | 'after:gitPush'
  | 'before:publish'
  | 'after:publish'
  | 'end';

/**
 * A function that executes at a specific lifecycle hook.
 */
export type HookFn = (context: ReleaseContext) => Promise<void> | void;

/**
 * Defines the structure of a release-pkg plugin.
 * A plugin can tap into various lifecycle hooks to add or modify behavior.
 */
export interface Plugin {
  name: string;
  hooks: Partial<Record<ReleaseHook, HookFn | HookFn[]>>;
}
