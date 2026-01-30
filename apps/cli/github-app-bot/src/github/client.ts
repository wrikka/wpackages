const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

export const githubRequestJson = async <T>(args: {
	readonly token: string;
	readonly path: string;
	readonly init?: RequestInit;
}): Promise<T> => {
	try {
		const res = await fetch(new URL(args.path, "https://api.github.com"), {
			...args.init,
			headers: new Headers({
				Accept: "application/vnd.github+json",
				"User-Agent": "@wpackages/github-app-bot",
				Authorization: `Bearer ${args.token}`,
				...(args.init?.headers as Record<string, string>),
			}),
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
