export const isTcpPortAvailable = async (
	port: number,
	hostname: string,
): Promise<boolean> => {
	const net = await import("node:net");

	return await new Promise<boolean>((resolve) => {
		const server = net.createServer();

		const cleanup = (): void => {
			try {
				server.removeAllListeners();
				server.close();
			} catch {
			}
		};

		server.once("error", () => {
			cleanup();
			resolve(false);
		});

		server.once("listening", () => {
			cleanup();
			resolve(true);
		});

		server.listen(port, hostname);
	});
};
