export const handler = (_request: Request, params: Record<string, string>) => ({
	id: params.id,
	name: `User ${params.id}`,
});
