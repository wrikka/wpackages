import { parseSync } from "oxc-parser";
import { findImports, findImportsFrom, findImportSources } from "./find-imports.util";

// Usage examples

const code = `
import React from 'react';
import { useState, useEffect } from 'react';
import * as Utils from './utils';
import axios from 'axios';
`;

const { program } = parseSync("example.ts", code);

// Example 1: Find all imports
console.log("=== All Imports ===");
const imports = findImports(program);
for (const imp of imports) {
	console.log(`From: ${imp.source}`);
	console.log(`  Specifiers: ${imp.specifiers.join(", ")}`);
	console.log(`  Default: ${imp.isDefault}, Namespace: ${imp.isNamespace}`);
}

// Example 2: Find import sources only
console.log("\n=== Import Sources ===");
const sources = findImportSources(program);
console.log(sources);

// Example 3: Find imports from specific package
console.log("\n=== React Imports ===");
const reactImports = findImportsFrom(program, "react");
console.log(reactImports);
