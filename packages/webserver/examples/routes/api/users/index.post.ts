import { email, number, object, string } from "@wpackages/schema";

export const schema = {
	body: object({
		name: string(),
		email: email(),
	}),
	response: object({
		id: number(),
		name: string(),
		email: string(),
	}),
};

export const handler = async (request: Request) => {
	const body = await request.json();
	return { id: 3, ...body };
};
