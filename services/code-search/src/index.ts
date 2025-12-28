import { runCodeSearchApp } from "./app";

runCodeSearchApp().catch((error) => {
	console.error(error);
	process.exit(1);
});
