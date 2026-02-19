import { shannonFanoCoding } from "./shannon-fano";

const text = "this is an example for shannon-fano encoding";
const result = shannonFanoCoding(text);

if (result) {
	console.log("Original Text:", text);
	console.log("Encoded String:", result.encodedString);
	console.log("Shannon-Fano Codes:", result.codes);
} else {
	console.log("Could not encode the text.");
}
