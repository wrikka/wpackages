import type { ResolvedConfig } from 'vite';

export type ViteConfig = ResolvedConfig;

export interface PackageInfo {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}
