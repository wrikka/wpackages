export const createPortUrl = (port: number, hostname = "localhost"): string => `http://${hostname}:${port}`;

export const parsePortFromUrl = (url: string): number | undefined => {
	try {
		const parsed = new URL(url);
		const port = Number.parseInt(parsed.port, 10);
		return Number.isNaN(port) ? undefined : port;
	} catch {
		return undefined;
	}
};
