import { gen, succeed, tryPromise } from "./";

const fetchUser = (id: number): Promise<{ id: number; name: string }> => {
	return Promise.resolve({ id, name: `User ${id}` });
};

const fetchPosts = (
	_userId: number,
): Promise<Array<{ id: number; title: string }>> => {
	return Promise.resolve([
		{ id: 1, title: "Post 1" },
		{ id: 2, title: "Post 2" },
	]);
};

const main = gen(function*() {
	const user = yield* tryPromise(
		() => fetchUser(1),
		(e) => ({ _tag: "Error" as const, message: String(e) }),
	);
	const posts = yield* tryPromise(
		() => fetchPosts(user.id),
		(e) => ({ _tag: "Error" as const, message: String(e) }),
	);
	return succeed({ user, posts });
});

if (import.meta.main) {
	const result = await main();
	console.log(result);
}
