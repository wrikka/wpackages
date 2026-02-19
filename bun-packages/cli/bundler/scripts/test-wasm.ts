import testConfig from "../bunpack.test.config";
import { build } from "../src/index";

console.log("Running WASM build test...");

build(testConfig).then(() => {
	console.log("WASM build test completed successfully.");
}).catch(err => {
	console.error("WASM build test failed:", err);
	process.exit(1);
});
