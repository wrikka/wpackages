import { diffieHellmanKeyExchange } from "./diffie-hellman";

const p = 23;
const g = 5;

const result = diffieHellmanKeyExchange(p, g);

console.log("Alice public key:", result.alice.publicKey);
console.log("Alice private key:", result.alice.privateKey);
console.log("Bob public key:", result.bob.publicKey);
console.log("Bob private key:", result.bob.privateKey);
console.log("Shared secret:", result.sharedSecret);
