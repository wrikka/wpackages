export function json(data: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: {
			...init?.headers,
			"Content-Type": "application/json",
		},
	});
}

export function text(data: string, init?: ResponseInit): Response {
	return new Response(data, {
		...init,
		headers: {
			...init?.headers,
			"Content-Type": "text/plain",
		},
	});
}
