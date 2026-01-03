import { z } from "zod";
import { HttpError } from "../error";

export async function parseBody<T extends z.ZodTypeAny>(
	req: Request,
	schema: T,
): Promise<z.infer<T>> {
	try {
		const json = await req.json();
		return schema.parse(json);
	} catch (error: unknown) {
		if (error instanceof z.ZodError) {
			const zodError = error as z.ZodError;
			throw new HttpError(400, JSON.stringify(zodError.format()));
		}
		throw new HttpError(400, "Invalid JSON body");
	}
}
