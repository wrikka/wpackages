import { Effect as FunctionalEffect } from "@wpackages/functional";
import { Effect, Layer } from "@wpackages/functional";
import { makeConsole } from "./services";
import type { Console as ConsoleService, LogMessage } from "./types";
export type { Console as ConsoleService, ConsoleConfig, LogLevel, LogMessage } from "./types";

export const Console = FunctionalEffect.tag<ConsoleService>();

export const ConsoleLive = Layer.succeed(Console, makeConsole());

export const log = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.log(message);
  });

export const info = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.info(message);
  });

export const warn = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.warn(message);
  });

export const error = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.error(message);
  });

export const debug = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.debug(message);
  });

export const fatal = (message: LogMessage) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    yield svc.fatal(message);
  });

export const logSpan = (context: string) =>
  Effect.gen(function*() {
    const svc = yield Effect.get(Console);
    return svc.withContext(context);
  });

export * from "./services";
export * from "./utils";
