export interface WServerOptions {
	runtime?: {
		env?: string;
		port?: number;
	};

	features?: {
		pages?: boolean;
		api?: boolean;
		websocket?: boolean;
		cron?: boolean;
	};

	routing?: {
		pages?: { directory?: string };
		api?: { directory?: string; prefix?: string };
		websocket?: { directory?: string; prefix?: string };
	};

	server?: {
		middleware?: { route?: string; handler: string }[];
	};

	auth?: {
		strategy?: "jwt" | "session" | "oauth";
		jwt?: {
			secret?: string;
			expiresIn?: string;
		};
		oauth?: Record<string, { clientId?: string; clientSecret?: string }>;
	};

	tasks?: {
		schedule?: string;
		handler: string;
	}[];

	data?: {
		storage?: Record<string, { driver: string; [key: string]: unknown }>;
		database?: {
			default?: string;
			connections?: Record<string, { driver: string; url?: string }>;
		};
	};

	security?: {
		cors?: { origin?: string | string[] };
	};

	log?: {
		level?: "info" | "warn" | "error" | "debug";
	};
}
