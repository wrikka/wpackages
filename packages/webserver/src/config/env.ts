import { z } from "zod";

const toBoolean = z
	.union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
	.transform((v) => v === "1" || v === "true");

const envSchema = z.object({
	PORT: z.coerce.number().int().positive().default(3000),
	PAYLOAD_BYTES: z.coerce.number().int().nonnegative().default(0),
	SERVICE_NAME: z.string().min(1).default("webserver"),
	CORS_ALLOWED_ORIGINS: z.string().optional(),
	MAX_BODY_BYTES: z.coerce.number().int().positive().default(1_048_576),
	RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
	RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
	JWT_SECRET: z.string().min(1).optional(),
	DATABASE_URL: z.string().min(1).optional(),
	DB_URL: z.string().min(1).optional(),
	TEST_MODE: toBoolean.optional().default(false),

	// Performance flags
	ENABLE_HTTP_LOGGER: toBoolean.optional().default(true),
	ENABLE_METRICS: toBoolean.optional().default(true),
	ENABLE_TRACING: toBoolean.optional().default(true),
	ENABLE_CORS: toBoolean.optional().default(true),
	ENABLE_AUTH: toBoolean.optional().default(true),
	ENABLE_RATE_LIMIT: toBoolean.optional().default(true),
	ENABLE_SECURITY_HEADERS: toBoolean.optional().default(true),
	ENABLE_QUERY_PARSER: toBoolean.optional().default(true),
	ENABLE_BODY_LIMIT: toBoolean.optional().default(true),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (input: NodeJS.ProcessEnv = process.env): Env => {
	return envSchema.parse(input);
};

export const isTestMode = (env: Env): boolean => {
	return env.TEST_MODE;
};

export const getDatabaseUrl = (env: Env): string | null => {
	return env.DATABASE_URL ?? env.DB_URL ?? null;
};
