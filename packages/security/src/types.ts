export interface SecurityEnv {
	readonly JWT_SECRET: string;
	readonly RATE_LIMIT_WINDOW_MS: number;
	readonly RATE_LIMIT_MAX: number;
}
