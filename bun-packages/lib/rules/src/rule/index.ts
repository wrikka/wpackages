import { Context, Effect, Layer } from "effect";
import type { Rule } from "../types";

export class RuleError {
  readonly _tag = "RuleError";
  constructor(readonly error: unknown) {}
}

export interface RuleService {
  readonly addRule: (
    rule: Rule,
  ) => Effect.Effect<void, RuleError>;
  readonly removeRule: (id: string) => Effect.Effect<void, RuleError>;
  readonly execute: (
    context: unknown,
  ) => Effect.Effect<void, RuleError>;
  readonly listRules: () => Effect.Effect<Rule[], RuleError>;
}

export const RuleService = Context.GenericTag<RuleService>("RuleService");

export const make = Effect.gen(function* (_) {
  const rules = new Map<string, Rule>();

  const addRule = (rule: Rule) =>
    Effect.sync(() => {
      rules.set(rule.id, rule);
    });

  const removeRule = (id: string) =>
    Effect.sync(() => {
      rules.delete(id);
    });

  const execute = (context: unknown) =>
    Effect.gen(function* (_) {
      for (const rule of rules.values()) {
        try {
          if (rule.condition(context)) {
            yield* Effect.tryPromise({
              try: () => rule.action(context),
              catch: (error) => new RuleError(error),
            });
          }
        } catch (error) {
          yield* Effect.fail(new RuleError(error));
        }
      }
    });

  const listRules = () => Effect.succeed(Array.from(rules.values()));

  return {
    addRule,
    removeRule,
    execute,
    listRules,
  } as RuleService;
});

export const RuleServiceLive = Layer.effect(RuleService, make);
