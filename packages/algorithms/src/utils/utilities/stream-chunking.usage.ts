import { chunkData, reconstructChunks } from "./stream-chunking";

const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

const chunks = Array.from(chunkData(data, { chunkSize: 3, overlap: 1 }));
console.log("Chunks:", chunks.length);

const reconstructed = reconstructChunks(chunks, 1);
console.log("Reconstructed:", Array.from(reconstructed));
