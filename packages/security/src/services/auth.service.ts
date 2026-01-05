import { Context, Effect } from "effect";

export class AuthError {
	readonly _tag = "AuthError";
	constructor(readonly message: string = "Unauthorized") {}
}

// This will be expanded to handle JWT logic
export class AuthService {
	static readonly Current = Context.GenericTag<AuthService>("AuthService");

	constructor(private readonly secret: string) {}

	// Placeholder for JWT generation
	generateToken(payload: object): Effect.Effect<string> {
		// In a real implementation, we would use a library like jose or jsonwebtoken
		return Effect.succeed(JSON.stringify(payload) + "." + this.secret);
	}

	// Placeholder for JWT validation
	validateToken(token: string): Effect.Effect<object, AuthError> {
		const parts = token.split(".");
		if (parts.length !== 2 || parts[1] !== this.secret) {
			return Effect.fail(new AuthError("Invalid token"));
		}
		try {
			return Effect.succeed(JSON.parse(parts[0]));
		} catch {
			return Effect.fail(new AuthError("Invalid token payload"));
		}
	}
}
