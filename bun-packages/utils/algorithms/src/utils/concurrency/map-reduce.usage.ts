import { mapReduce, parallelMap, parallelReduce } from "./map-reduce";

const data = [1, 2, 3, 4, 5];

const mapReduceResult = await mapReduce(data, {
	mapper: (x) => x * 2,
	reducer: (acc, curr) => acc + curr,
	initialValue: 0,
});
console.log("MapReduce result:", mapReduceResult);

const mapped = await parallelMap(data, (x) => x * 2);
console.log("Mapped:", mapped);

const reduced = await parallelReduce(data, (acc, curr) => acc + curr, 0);
console.log("Reduced:", reduced);
