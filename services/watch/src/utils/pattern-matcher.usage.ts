import { createPatternMatcher, matchAnyPattern, matchPattern } from "./pattern-matcher";

console.log("--- Pattern Matcher Usage ---");

// matchPattern
const filePath1 = "src/components/Button.tsx";
const pattern1 = "src/**/*.tsx";
console.log(
	`matchPattern('${filePath1}', '${pattern1}') ->`,
	matchPattern(filePath1, pattern1),
);

const filePath2 = "assets/logo.svg";
const pattern2 = "*.jpg";
console.log(
	`matchPattern('${filePath2}', '${pattern2}') ->`,
	matchPattern(filePath2, pattern2),
);

// matchAnyPattern
const filesToTest = ["image.png", "document.pdf", "archive.zip"];
const ignorePatterns = ["*.pdf", "*.zip"];
filesToTest.forEach((file) => {
	console.log(
		`matchAnyPattern('${file}', [${ignorePatterns.join(", ")}]) ->`,
		matchAnyPattern(file, ignorePatterns),
	);
});

// createPatternMatcher
const nodeModulesMatcher = createPatternMatcher([
	"node_modules/**",
	"**/__tests__/**",
]);

const testPaths = [
	"node_modules/react/index.js",
	"src/components/__tests__/Button.test.ts",
	"src/App.ts",
];

console.log("\n--- createPatternMatcher Example ---");
testPaths.forEach((path) => {
	console.log(`Matcher test for '${path}':`, nodeModulesMatcher(path));
});
