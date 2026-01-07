import { Effect, Layer } from "effect";
import { z } from "zod";

const toBoolean = z
	.union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
	.transform((v) => v === "1" || v === "true");

export const ConfigSchema = z.object({
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
	STATIC_ASSETS_PATH: z.string().min(1).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

export class ConfigLive extends Effect.Tag("Config")<ConfigLive, Config>() {}

export const ConfigLiveLayer = Layer.effect(
	ConfigLive,
	Effect.try({
		try: () => ConfigSchema.parse(process.env),
		catch: (error) => new Error(`Failed to parse environment variables: ${JSON.stringify(error)}`),
	}),
);
