import { Effect } from "effect";

interface User {
	id: number;
	name: string;
}

export const getUser = (id: number): Effect.Effect<User, Error> =>
	Effect.tryPromise({
		try: () => fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(res => res.json()),
		catch: (unknown) => new Error(`Failed to fetch user: ${unknown}`),
	});
