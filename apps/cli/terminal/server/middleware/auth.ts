export default defineEventHandler(async (event) => {
	const token = getCookie(event, "auth-token");
	if (!token) {
		throw createError({ statusCode: 401, message: "Unauthorized" });
	}
});
