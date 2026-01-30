interface ErrorData {
	readonly type: "runtime" | "compile" | "server";
	readonly message: string;
	readonly stack?: string;
	readonly file?: string;
	readonly line?: number;
	readonly column?: number;
}

class ErrorOverlay {
	private overlay: HTMLElement | null = null;
	private ws: WebSocket | null = null;

	constructor() {
		this.init();
	}

	private init() {
		this.createOverlay();
		this.connectWebSocket();
		this.setupErrorListeners();
	}

	private createOverlay() {
		this.overlay = document.createElement("div");
		this.overlay.id = "wdev-error-overlay";
		this.overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.85);
			z-index: 999999;
			display: none;
			align-items: center;
			justify-content: center;
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		`;

		const container = document.createElement("div");
		container.style.cssText = `
			background: #1e1e1e;
			border-radius: 8px;
			max-width: 800px;
			max-height: 80vh;
			overflow: auto;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
			margin: 20px;
		`;

		const header = document.createElement("div");
		header.style.cssText = `
			background: #d32f2f;
			color: white;
			padding: 16px 20px;
			border-radius: 8px 8px 0 0;
			font-weight: 600;
			font-size: 18px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		`;

		const title = document.createElement("span");
		title.textContent = "Error";
		header.appendChild(title);

		const closeButton = document.createElement("button");
		closeButton.textContent = "×";
		closeButton.style.cssText = `
			background: none;
			border: none;
			color: white;
			font-size: 28px;
			cursor: pointer;
			padding: 0;
			line-height: 1;
			width: 28px;
			height: 28px;
		`;
		closeButton.onclick = () => this.hide();
		header.appendChild(closeButton);

		const content = document.createElement("div");
		content.id = "wdev-error-content";
		content.style.cssText = `
			padding: 20px;
			color: #e0e0e0;
			font-size: 14px;
			line-height: 1.6;
		`;

		container.appendChild(header);
		container.appendChild(content);
		this.overlay.appendChild(container);
		document.body.appendChild(this.overlay);
	}

	private connectWebSocket() {
		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/ws`;

		this.ws = new WebSocket(wsUrl);

		this.ws.addEventListener("message", (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data.type === "wdev:error") {
					this.showError(data.data);
				}
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error);
			}
		});

		this.ws.addEventListener("close", () => {
			setTimeout(() => this.connectWebSocket(), 3000);
		});
	}

	private setupErrorListeners() {
		window.addEventListener("error", (event) => {
			this.showError({
				type: "runtime",
				message: event.message || "Unknown error",
				stack: event.error?.stack,
				file: event.filename,
				line: event.lineno,
				column: event.colno,
			});
		});

		window.addEventListener("unhandledrejection", (event) => {
			this.showError({
				type: "runtime",
				message: event.reason?.message || String(event.reason),
				stack: event.reason?.stack,
			});
		});
	}

	showError(error: ErrorData) {
		if (!this.overlay) return;

		const content = this.overlay.querySelector("#wdev-error-content");
		if (!content) return;

		const typeBadge = this.getTypeBadge(error.type);
		const fileLocation = error.file
			? `<div style="color: #90caf9; margin-top: 12px; font-family: monospace;">${error.file}${error.line ? `:${error.line}` : ""}${error.column ? `:${error.column}` : ""}</div>`
			: "";

		const stackTrace = error.stack
			? `<pre style="background: #2d2d2d; padding: 12px; border-radius: 4px; overflow-x: auto; margin-top: 16px; font-size: 12px; color: #b0b0b0;">${this.escapeHtml(error.stack)}</pre>`
			: "";

		content.innerHTML = `
			<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
				${typeBadge}
			</div>
			<div style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">${this.escapeHtml(error.message)}</div>
			${fileLocation}
			${stackTrace}
		`;

		this.overlay.style.display = "flex";
	}

	private getTypeBadge(type: string): string {
		const colors = {
			runtime: "#f44336",
			compile: "#ff9800",
			server: "#2196f3",
		} as const;
		const color = colors[type as keyof typeof colors] || "#757575";

		return `<span style="background: ${color}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${type}</span>`;
	}

	private escapeHtml(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	hide() {
		if (this.overlay) {
			this.overlay.style.display = "none";
		}
	}
}

if (typeof window !== "undefined") {
	new ErrorOverlay();
}

export { ErrorOverlay };
export type { ErrorData };
