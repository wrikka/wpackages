export interface EnvConfig {
	NODE_ENV: "development" | "production" | "test";
	LOG_LEVEL: "debug" | "info" | "warn" | "error";
	THEME_MODE: "light" | "dark" | "auto";
}

export const getEnv = (): EnvConfig => {
	return {
		NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
		LOG_LEVEL: (process.env.LOG_LEVEL as EnvConfig["LOG_LEVEL"]) || "info",
		THEME_MODE: (process.env.THEME_MODE as EnvConfig["THEME_MODE"]) || "auto",
	};
};
