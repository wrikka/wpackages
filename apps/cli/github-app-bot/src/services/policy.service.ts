import * as Effect from "effect";
import { Layer, Context } from "effect";
import { readFileSync } from "node:fs";
import type { PolicyService, Policy } from "../types";
import { PolicyError } from "../types";

export const PolicyService = Context.GenericTag<PolicyService>("PolicyService");

export const PolicyServiceLive = Effect.succeed<PolicyService>({
	readPolicy: (path) =>
		Effect.try({
			try: () => {
				const raw = readFileSync(path, "utf8");
				return JSON.parse(raw) as Policy;
			},
			catch: (error) =>
				new PolicyError(
					`Failed to read policy from ${path}: ${error instanceof Error ? error.message : String(error)}`,
				),
		}),

	validatePolicy: (policy) =>
		Effect.sync(() => {
			if (policy.maxNewDependencies != null && policy.maxNewDependencies < 0) {
				throw new PolicyError("maxNewDependencies must be non-negative");
			}
		}),
});

export const PolicyServiceLayer = Layer.effect(PolicyService, PolicyServiceLive);
