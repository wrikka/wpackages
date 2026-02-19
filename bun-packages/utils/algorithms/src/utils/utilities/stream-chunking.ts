export interface ChunkOptions {
	chunkSize: number;
	overlap?: number;
}

export function* chunkData(data: Uint8Array, options: ChunkOptions): Generator<Uint8Array> {
	const { chunkSize, overlap = 0 } = options;

	if (overlap >= chunkSize) {
		throw new Error("Overlap must be less than chunk size");
	}

	for (let i = 0; i < data.length; i += chunkSize - overlap) {
		const end = Math.min(i + chunkSize, data.length);
		yield data.slice(i, end);

		if (end === data.length) break;
	}
}

export async function* chunkStream(
	stream: ReadableStream<Uint8Array>,
	options: ChunkOptions,
): AsyncGenerator<Uint8Array> {
	const { chunkSize, overlap = 0 } = options;

	if (overlap >= chunkSize) {
		throw new Error("Overlap must be less than chunk size");
	}

	const reader = stream.getReader();
	let buffer = new Uint8Array(0);

	try {
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				if (buffer.length > 0) {
					yield buffer;
				}
				break;
			}

			const newBuffer = new Uint8Array(buffer.length + value.length);
			newBuffer.set(buffer);
			newBuffer.set(value, buffer.length);
			buffer = newBuffer;

			while (buffer.length >= chunkSize) {
				yield buffer.slice(0, chunkSize);
				buffer = buffer.slice(chunkSize - overlap);
			}
		}
	} finally {
		reader.releaseLock();
	}
}

export function reconstructChunks(chunks: Uint8Array[], overlap: number = 0): Uint8Array {
	if (chunks.length === 0) return new Uint8Array(0);
	if (chunks.length === 1) return chunks[0]!;

	const totalSize = chunks.reduce((sum, chunk, index) => {
		if (index === 0) return chunk.length;
		return sum + chunk.length - overlap;
	}, 0);

	const result = new Uint8Array(totalSize);
	let offset = 0;

	result.set(chunks[0]!, offset);
	offset += chunks[0]!.length;

	for (let i = 1; i < chunks.length; i++) {
		result.set(chunks[i]!.slice(overlap), offset);
		offset += chunks[i]!.length - overlap;
	}

	return result;
}
