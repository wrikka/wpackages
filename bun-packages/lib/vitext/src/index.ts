import { createVitextApp } from "./app";
import { defineConfig } from "./config/vitext";
import { DevServer } from "./services/dev-server";

export type { DevServerInstance } from "@wpackages/devserver";
export type { VitextAppInstance } from "./app";
export type { BuildConfig, VitextConfig } from "./types/config";
export type { VitextServer } from "./types/server";

export { createVitextApp, defineConfig, DevServer };
