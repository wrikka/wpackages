import { prompt, treeselect } from "../src";

async function main() {
	const selectedItem = await prompt(
		treeselect({
			message: "Select items",
			nodes: [
				{
					value: "dir1",
					label: "Directory 1",
					children: [
						{ value: "file1.txt", label: "file1.txt" },
						{ value: "file2.txt", label: "file2.txt" },
					],
				},
				{
					value: "dir2",
					label: "Directory 2",
					expanded: false,
					children: [
						{ value: "file3.txt", label: "file3.txt" },
					],
				},
				{ value: "file4.txt", label: "file4.txt" },
			],
		}),
	);

	if (selectedItem) {
		console.log(`You selected: ${String(selectedItem)}`);
	} else {
		console.log("No selection made.");
	}
}

void main().catch(console.error);
