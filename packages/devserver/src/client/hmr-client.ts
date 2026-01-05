/**
 * HMR Client for @wpackages/devserver
 * Handles WebSocket connection and hot module replacement
 */

(function() {
	const socket = new WebSocket(`ws://${window.location.host}`);

	socket.addEventListener("open", () => {
		console.log("[wdev:hmr] Connected to dev server");
		socket.send(JSON.stringify({ type: "wdev:client-ready" }));
	});

	socket.addEventListener("message", (event) => {
		const message = JSON.parse(event.data);

		switch (message.type) {
			case "wdev:hmr-update":
				handleHmrUpdate(message.data);
				break;
			case "wdev:error":
				handleError(message.data);
				break;
		}
	});

	socket.addEventListener("close", () => {
		console.log("[wdev:hmr] Disconnected from dev server");
	});

	socket.addEventListener("error", (error) => {
		console.error("[wdev:hmr] WebSocket error:", error);
	});

	function handleHmrUpdate(data: any) {
		if (data.type === "full-reload") {
			console.log("[wdev:hmr] Full reload triggered");
			window.location.reload();
		}
	}

	function handleError(data: any) {
		console.error("[wdev:hmr] Error:", data.message);
		// TODO: Show error overlay
	}
})();
