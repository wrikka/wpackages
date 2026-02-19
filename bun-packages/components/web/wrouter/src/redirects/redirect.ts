export interface RedirectConfig {
	readonly from: string;
	readonly to: string;
	readonly statusCode?: 301 | 302 | 307 | 308;
	readonly preserveQuery?: boolean;
	readonly preserveHash?: boolean;
}

export interface RedirectMatch {
	readonly redirect: RedirectConfig;
	readonly to: string;
}

export class RedirectManager {
	private readonly redirects = new Map<string, RedirectConfig>();

	registerRedirect(redirect: RedirectConfig): void {
		this.redirects.set(redirect.from, redirect);
	}

	registerRedirects(redirects: readonly RedirectConfig[]): void {
		for (const redirect of redirects) {
			this.registerRedirect(redirect);
		}
	}

	findRedirect(pathname: string): RedirectMatch | undefined {
		const directMatch = this.redirects.get(pathname);
		if (directMatch) {
			return {
				redirect: directMatch,
				to: this.buildRedirectUrl(directMatch, pathname),
			};
		}

		for (const [from, redirect] of this.redirects) {
			if (this.matchPattern(from, pathname)) {
				const to = this.buildRedirectUrl(redirect, pathname, from);
				return { redirect, to };
			}
		}

		return undefined;
	}

	private matchPattern(pattern: string, pathname: string): boolean {
		if (pattern === pathname) {
			return true;
		}

		if (pattern.includes("*")) {
			const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
			return regex.test(pathname);
		}

		if (pattern.includes(":")) {
			const patternParts = pattern.split("/");
			const pathParts = pathname.split("/");

			if (patternParts.length !== pathParts.length) {
				return false;
			}

			for (let i = 0; i < patternParts.length; i++) {
				const patternPart = patternParts[i];
				const pathPart = pathParts[i];

				if (!patternPart || !pathPart) {
					continue;
				}

				if (patternPart.startsWith(":")) {
					continue;
				}

				if (patternPart !== pathPart) {
					return false;
				}
			}

			return true;
		}

		return false;
	}

	private buildRedirectUrl(redirect: RedirectConfig, pathname: string, pattern?: string): string {
		let to = redirect.to;

		if (pattern && pattern.includes(":")) {
			const patternParts = pattern.split("/");
			const pathParts = pathname.split("/");

			for (let i = 0; i < patternParts.length; i++) {
				const patternPart = patternParts[i];
				const pathPart = pathParts[i];

				if (patternPart?.startsWith(":")) {
					const paramName = patternPart.slice(1);
					to = to.replace(`:${paramName}`, pathPart ?? "");
				}
			}
		}

		if (pattern && pattern.includes("*")) {
			const wildcardIndex = pattern.indexOf("*");
			const wildcardValue = pathname.slice(wildcardIndex);
			to = to.replace("*", wildcardValue);
		}

		if (redirect.preserveQuery) {
			const queryIndex = pathname.indexOf("?");
			if (queryIndex !== -1) {
				const query = pathname.slice(queryIndex);
				to += query;
			}
		}

		if (redirect.preserveHash) {
			const hashIndex = pathname.indexOf("#");
			if (hashIndex !== -1) {
				const hash = pathname.slice(hashIndex);
				to += hash;
			}
		}

		return to;
	}

	getRedirect(from: string): RedirectConfig | undefined {
		return this.redirects.get(from);
	}

	getAllRedirects(): readonly RedirectConfig[] {
		return Object.freeze([...this.redirects.values()]);
	}

	removeRedirect(from: string): void {
		this.redirects.delete(from);
	}

	clear(): void {
		this.redirects.clear();
	}
}

export const createRedirectManager = () => {
	return new RedirectManager();
};

export const permanentRedirect = (from: string, to: string): RedirectConfig => {
	return Object.freeze({
		from,
		to,
		statusCode: 301,
	});
};

export const temporaryRedirect = (from: string, to: string): RedirectConfig => {
	return Object.freeze({
		from,
		to,
		statusCode: 302,
	});
};

export const preserveQueryRedirect = (from: string, to: string, statusCode: 301 | 302 = 301): RedirectConfig => {
	return Object.freeze({
		from,
		to,
		statusCode,
		preserveQuery: true,
	});
};
