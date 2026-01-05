import { Effect, Layer, Context } from "effect";
import { pathToFileURL } from "node:url";
import path from "node:path";
import type { LinterPlugin } from "../types/plugins";
import type { SGRule } from "@ast-grep/napi";

export interface AstGrepConfig {
    readonly id: string;
    readonly message: string;
    readonly severity: "warning" | "error";
    readonly rule: SGRule;
}

export interface LinterConfig {
  readonly plugins: readonly LinterPlugin[];
  readonly astGrep?: {
      readonly rules: readonly AstGrepConfig[];
  }
}

export class ConfigLoader extends Context.Tag("ConfigLoader")<ConfigLoader, {
  readonly load: (configFile?: string) => Effect.Effect<LinterConfig, Error>;
}>() {}

export const ConfigLoaderLive = Layer.succeed(
  ConfigLoader,
  {
    load: (configFile = "wlint.config.mjs") => Effect.tryPromise({
      try: async () => {
        // When running the compiled code, the config file will be relative to the dist folder
        const configPath = path.resolve(process.cwd(), 'dist', configFile);
        const fileUrl = pathToFileURL(configPath).href;
        const configModule = await import(fileUrl);
        return configModule.default as LinterConfig;
      },
      catch: (error) => new Error(`Failed to load config file: ${configFile}\n${error}`),
    }),
  },
);
