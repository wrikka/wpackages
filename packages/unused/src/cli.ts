#!/usr/bin/env node

import { Command } from "commander";
import { findUnused } from "./index";

const program = new Command();

program
	.version("0.1.0")
	.description("A tool to find unused files, dependencies, and exports in your project.")
	.action(() => {
		findUnused();
	});

program.parse(process.argv);
