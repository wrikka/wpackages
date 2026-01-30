import { createDevServer } from "../src";
import { join } from "node:path";

const devServer = createDevServer({
	root: process.cwd(),
	port: 3443,
	hostname: "localhost",
	server: {
		// Enable HTTPS with custom certificates
		https: {
			key: join(process.cwd(), "certs", "key.pem"),
			cert: join(process.cwd(), "certs", "cert.pem"),
		},
	},
});

devServer.onReload(() => {
	console.log("Files changed, reloading...");
});

void devServer.start();

console.log("Dev server started on https://localhost:3443");
console.log("Make sure you have valid SSL certificates in the ./certs directory");

process.on("SIGINT", () => {
	devServer.stop().then(() => {
		console.log("Dev server stopped.");
		process.exit(0);
	}).catch((error) => {
		console.error("Error stopping dev server:", error);
		process.exit(1);
	});
});
