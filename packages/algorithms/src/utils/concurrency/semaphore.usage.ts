import { Semaphore } from "./semaphore";

const semaphore = new Semaphore(2);

async function task(id: number): Promise<void> {
	await semaphore.execute(async () => {
		console.log(`Task ${id} started`);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log(`Task ${id} completed`);
	});
}

await Promise.all([task(1), task(2), task(3), task(4)]);
