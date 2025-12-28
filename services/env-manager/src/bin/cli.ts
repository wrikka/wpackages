#!/usr/bin/env node
import { runEnvManagerApp } from "../index";

runEnvManagerApp().catch((error) => {
	console.error(error);
	process.exit(1);
});
