import { createHmac, timingSafeEqual } from "node:crypto";

export const verifyGitHubSignature = (args: {
	readonly secret: string;
	readonly rawBody: Uint8Array;
	readonly signature256: string | undefined;
}): boolean => {
	const header = args.signature256;
	if (!header || !header.startsWith("sha256=")) return false;

	const expected = createHmac("sha256", args.secret).update(args.rawBody).digest("hex");
	const actual = header.slice("sha256=".length);
	if (expected.length !== actual.length) return false;
	return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(actual, "utf8"));
};
