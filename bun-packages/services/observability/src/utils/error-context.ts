export interface RequestContext {
	method?: string;
	url?: string;
	headers?: Record<string, string | string[] | undefined>;
	body?: unknown;
	query?: Record<string, unknown>;
	ip?: string;
	userAgent?: string;
}

export interface ResponseContext {
	statusCode?: number;
	headers?: Record<string, string>;
	body?: unknown;
	duration?: number;
}

export interface UserContext {
	id?: string;
	email?: string;
	role?: string;
	sessionId?: string;
}

export interface ErrorContextData {
	request?: RequestContext;
	response?: ResponseContext;
	user?: UserContext;
	environment?: Record<string, unknown>;
	custom?: Record<string, unknown>;
}

export class ErrorContextBuilder {
	private context: ErrorContextData = {};

	withRequest(request: RequestContext): this {
		this.context.request = request;
		return this;
	}

	withResponse(response: ResponseContext): this {
		this.context.response = response;
		return this;
	}

	withUser(user: UserContext): this {
		this.context.user = user;
		return this;
	}

	withEnvironment(env: Record<string, unknown>): this {
		this.context.environment = env;
		return this;
	}

	withCustom(custom: Record<string, unknown>): this {
		this.context.custom = custom;
		return this;
	}

	build(): ErrorContextData {
		return { ...this.context };
	}

	reset(): this {
		this.context = {};
		return this;
	}
}

export function createErrorContext(): ErrorContextBuilder {
	return new ErrorContextBuilder();
}
