const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

export const githubRequestJson = async (args: {
	readonly token: string;
	readonly path: string;
	readonly init?: RequestInit;
}): Promise<unknown> => {
	try {
		const res = await fetch(new URL(args.path, "https://api.github.com"), {
			...args.init,
			headers: {
				Accept: "application/vnd.github+json",
				"User-Agent": "@wpackages/github-app-bot",
				Authorization: `Bearer ${args.token}`,
				...(typeof args.init?.headers === "object" ? args.init.headers : {}),
			},
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			throw new Error(`GitHub request failed: ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`);
		}

		return res.json();
	} catch (e) {
		throw toError(e);
	}
};
