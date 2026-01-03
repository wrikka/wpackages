import type { IncomingMessage } from "node:http";

export const readRawBody = async (req: IncomingMessage): Promise<Uint8Array> => {
	const chunks: Buffer[] = [];
	for await (const chunk of req) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
};
