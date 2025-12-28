#!/usr/bin/env node
import { runFormatterApp } from "../app";

runFormatterApp().catch((error) => {
	console.error(error);
	process.exit(1);
});
