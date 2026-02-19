import { getTerminalSize, isColorSupported } from "./terminal.utils";

// Example 1: Get terminal size
console.log("Terminal Size:");
const size = getTerminalSize();
console.log(`Width: ${size.width} columns`);
console.log(`Height: ${size.height} rows`);

// Example 2: Check color support
console.log("\nColor Support:");
const colorSupport = isColorSupported();
console.log(`Colors supported: ${colorSupport ? "Yes" : "No"}`);

// Example 3: Responsive layout
console.log("\nResponsive Layout:");
if (size.width < 80) {
	console.log("Using compact layout for narrow terminal");
} else if (size.width < 120) {
	console.log("Using standard layout");
} else {
	console.log("Using wide layout with extra columns");
}

// Example 4: Conditional coloring
console.log("\nConditional Coloring:");
const message = "Hello, World!";
if (colorSupport) {
	// Use ANSI colors
	console.log(`\x1b[32m${message}\x1b[0m`);
} else {
	// Plain text
	console.log(message);
}

// Example 5: Center text in terminal
console.log("\nCentered Text:");
const text = "Centered Message";
const padding = Math.max(0, Math.floor((size.width - text.length) / 2));
console.log(" ".repeat(padding) + text);

// Example 6: Draw a box that fits the terminal
console.log("\nTerminal Box:");
const boxWidth = Math.min(size.width - 4, 60);
console.log("┌" + "─".repeat(boxWidth - 2) + "┐");
console.log("│" + " ".repeat(boxWidth - 2) + "│");
console.log(
	"│"
		+ " ".repeat(Math.floor((boxWidth - 14) / 2))
		+ "Terminal Box"
		+ " ".repeat(Math.ceil((boxWidth - 14) / 2))
		+ "│",
);
console.log("│" + " ".repeat(boxWidth - 2) + "│");
console.log("└" + "─".repeat(boxWidth - 2) + "┘");
