import { huffmanCoding } from "./huffman-coding";

const text = "this is an example for huffman encoding";
const result = huffmanCoding(text);

if (result) {
	console.log("Original Text:", text);
	console.log("Encoded String:", result.encodedString);
	console.log("Huffman Codes:", result.codes);
} else {
	console.log("Could not encode the text.");
}
