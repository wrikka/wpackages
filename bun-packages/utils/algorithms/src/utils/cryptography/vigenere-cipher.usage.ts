import { vigenereCipherEncrypt, vigenereCipherDecrypt } from "./vigenere-cipher";

const text = "Hello World!";
const key = "KEY";
const encrypted = vigenereCipherEncrypt(text, key);
const decrypted = vigenereCipherDecrypt(encrypted, key);

console.log("Original:", text);
console.log("Key:", key);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
