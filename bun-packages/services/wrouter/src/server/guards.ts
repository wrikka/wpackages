import { Effect } from "effect";
import type { RouteGuard } from "../types";
import { GuardError } from "../error";

export const createGuard = (
	name: string,
	canActivate: (params: Readonly<Record<string, string | number | boolean>>) => Effect.Effect<boolean, Error>,
): RouteGuard => Object.freeze({ name, canActivate });

export const authGuard = (checkAuth: () => Effect.Effect<boolean, Error>): RouteGuard =>
	createGuard("auth", () => checkAuth());

export const roleGuard = (requiredRoles: readonly string[]): RouteGuard =>
	createGuard("role", (params) => {
		const userRole = (params as { userRole?: string }).userRole;
		return Effect.succeed(requiredRoles.includes(userRole ?? ""));
	});

export const combineGuards = (guards: readonly RouteGuard[]): RouteGuard =>
	createGuard(
		`combined-${guards.map((g) => g.name).join("-")}`,
		(params) =>
			Effect.all(guards.map((guard) => guard.canActivate(params))).pipe(
				Effect.map((results) => results.every(Boolean)),
			),
	);
