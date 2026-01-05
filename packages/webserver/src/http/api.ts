export const api = {
	health: { path: "/healthz" },
	ready: { path: "/readyz" },
	user: { path: "/users/:id" },
	metrics: { path: "/metrics" },
} as const;
