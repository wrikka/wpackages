import { caesarCipherEncrypt, caesarCipherDecrypt } from "./caesar-cipher";

const text = "Hello World!";
const shift = 3;
const encrypted = caesarCipherEncrypt(text, shift);
const decrypted = caesarCipherDecrypt(encrypted, shift);

console.log("Original:", text);
console.log("Shift:", shift);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
