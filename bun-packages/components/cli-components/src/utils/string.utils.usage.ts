import { center, pad, stringWidth, stripAnsi, truncate, wrap } from "./string.utils";

// Example 1: Truncate
console.log("Truncate Examples:");
console.log(truncate("This is a very long string", 15)); // "This is a ve..."
console.log(truncate("Short", 10)); // "Short"

// Example 2: Pad
console.log("\nPad Examples:");
console.log(`[${pad("Name", 20)}]`); // "[Name                ]"
console.log(`[${pad("Age", 20, ".")}]`); // "[Age.................]"

// Example 3: Center
console.log("\nCenter Examples:");
console.log(`[${center("Title", 20)}]`); // "[       Title        ]"
console.log(`[${center("Hello", 15)}]`); // "[     Hello     ]"

// Example 4: Strip ANSI
console.log("\nStrip ANSI Examples:");
const coloredText = "\x1b[31mRed Text\x1b[0m";
console.log(`Colored: ${coloredText}`);
console.log(`Stripped: ${stripAnsi(coloredText)}`); // "Red Text"

// Example 5: String Width
console.log("\nString Width Examples:");
console.log(`Width of "Hello": ${stringWidth("Hello")}`); // 5
console.log(`Width of colored text: ${stringWidth(coloredText)}`); // 8

// Example 6: Wrap
console.log("\nWrap Examples:");
const longText = "This is a very long text that needs to be wrapped properly";
const wrapped = wrap(longText, 20);
console.log("Wrapped lines:");
for (const line of wrapped) {
	console.log(`  ${line}`);
}

// Example 7: Table formatting
console.log("\nTable Example:");
const headers = ["Name", "Age", "City"];
const rows = [
	["Alice", "25", "New York"],
	["Bob", "30", "London"],
	["Charlie", "35", "Tokyo"],
];

// Print header
console.log(headers.map((h) => pad(h, 15)).join(" | "));
console.log("-".repeat(53));

// Print rows
for (const row of rows) {
	console.log(row.map((cell) => pad(cell, 15)).join(" | "));
}
