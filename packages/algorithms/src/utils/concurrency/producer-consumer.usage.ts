import { ProducerConsumer } from "./producer-consumer";

const pc = new ProducerConsumer<number>(3);

const producer = async (id: number): Promise<void> => {
	for (let i = 0; i < 3; i++) {
		const item = id * 10 + i;
		await pc.produce(item);
		console.log(`Producer ${id} produced: ${item}`);
	}
};

const consumer = async (id: number): Promise<void> => {
	for (let i = 0; i < 3; i++) {
		const item = await pc.consume();
		console.log(`Consumer ${id} consumed: ${item}`);
	}
};

await Promise.all([producer(1), producer(2), consumer(1), consumer(2)]);

console.log("Stats:", pc.getStats());
