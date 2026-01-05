import { prompt, table } from "../src";

async function main() {
	const selectedUser = await prompt(
		table({
			message: "Select a user",
			headers: ["ID", "Name", "Email"],
			rows: [
				{ value: 1, data: { ID: 1, Name: "Alice", Email: "alice@example.com" } },
				{ value: 2, data: { ID: 2, Name: "Bob", Email: "bob@example.com" } },
				{ value: 3, data: { ID: 3, Name: "Charlie", Email: "charlie@example.com" } },
			],
		}),
	);

	if (selectedUser) {
		console.log(`You selected user with ID: ${String(selectedUser)}`);
	} else {
		console.log("No selection made.");
	}
}

void main().catch(console.error);
