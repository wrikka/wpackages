import type { WRouteRecord } from "../types";
import { matchRoute } from "../utils";

export interface PreloadStrategy {
	readonly type: "hover" | "visible" | "idle" | "manual";
	readonly delay?: number;
}

export interface PreloadConfig {
	readonly routes: readonly string[];
	readonly strategy: PreloadStrategy;
}

export class RoutePreloader {
	private readonly routes: readonly WRouteRecord[];
	private readonly preloadedRoutes = new Set<string>();
	private readonly preloadQueue = new Set<string>();
	private readonly observers = new Set<IntersectionObserver>();

	constructor(routes: readonly WRouteRecord[]) {
		this.routes = routes;
	}

	preload(pathname: string): void {
		if (this.preloadedRoutes.has(pathname) || this.preloadQueue.has(pathname)) {
			return;
		}

		this.preloadQueue.add(pathname);
		this.executePreload(pathname);
	}

	preloadMultiple(paths: readonly string[]): void {
		for (const path of paths) {
			this.preload(path);
		}
	}

	private async executePreload(pathname: string): Promise<void> {
		try {
			const match = matchRoute(pathname, this.routes);
			if (match) {
				await this.loadRouteComponent(match.route);
				this.preloadedRoutes.add(pathname);
			}
		} catch (error) {
			console.error(`Failed to preload route ${pathname}:`, error);
		} finally {
			this.preloadQueue.delete(pathname);
		}
	}

	private async loadRouteComponent(route: WRouteRecord): Promise<void> {
		if (typeof window === "undefined") {
			return;
		}

		const link = document.createElement("link");
		link.rel = "prefetch";
		link.href = route.file;
		document.head.appendChild(link);

		await new Promise((resolve) => {
			link.onload = resolve;
			link.onerror = resolve;
		});
	}

	setupHoverPreloading(selector: string = "[data-preload]"): void {
		if (typeof window === "undefined") {
			return;
		}

		document.addEventListener("mouseover", (event) => {
			const target = event.target as HTMLElement;
			const link = target.closest(selector) as HTMLAnchorElement;
			if (link?.href) {
				const url = new URL(link.href);
				this.preload(url.pathname);
			}
		});
	}

	setupVisiblePreloading(selector: string = "[data-preload-visible]"): void {
		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const target = entry.target as HTMLElement;
						const pathname = target.getAttribute("data-preload-path");
						if (pathname) {
							this.preload(pathname);
						}
						observer.unobserve(target);
					}
				}
			},
			{ threshold: 0.1 },
		);

		const elements = document.querySelectorAll(selector);
		for (const element of elements) {
			observer.observe(element);
		}

		this.observers.add(observer);
	}

	setupIdlePreloading(paths: readonly string[]): void {
		if (typeof window === "undefined" || !("requestIdleCallback" in window)) {
			setTimeout(() => this.preloadMultiple(paths), 100);
			return;
		}

		requestIdleCallback(() => {
			this.preloadMultiple(paths);
		});
	}

	isPreloaded(pathname: string): boolean {
		return this.preloadedRoutes.has(pathname);
	}

	getPreloadedRoutes(): readonly string[] {
		return Object.freeze([...this.preloadedRoutes]);
	}

	clear(): void {
		this.preloadedRoutes.clear();
		this.preloadQueue.clear();
		for (const observer of this.observers) {
			observer.disconnect();
		}
		this.observers.clear();
	}
}

export const createRoutePreloader = (routes: readonly WRouteRecord[]) => {
	return new RoutePreloader(routes);
};

export const createPreloadLink = (pathname: string): HTMLLinkElement => {
	const link = document.createElement("link");
	link.rel = "prefetch";
	link.href = pathname;
	return link;
};
