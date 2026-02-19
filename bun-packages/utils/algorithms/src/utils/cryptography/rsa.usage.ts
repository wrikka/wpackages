import { generateRSAKeys, rsaEncrypt, rsaDecrypt } from "./rsa";

const { publicKey, privateKey } = generateRSAKeys();

const message = 42;
const encrypted = rsaEncrypt(message, publicKey);
const decrypted = rsaDecrypt(encrypted, privateKey);

console.log("Original:", message);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
console.log("Match:", message === decrypted);
