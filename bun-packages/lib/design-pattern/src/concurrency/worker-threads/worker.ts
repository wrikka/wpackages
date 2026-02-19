// This script runs in a separate thread.

console.log('Worker: I am alive!');

// The `self` object refers to the global scope in a worker.
self.onmessage = (event: MessageEvent) => {
    console.log('Worker: Received message from main:', event.data);

    const { task, payload } = event.data;

    if (task === 'heavy-computation') {
        // Simulate a CPU-intensive task
        const result = payload * 10;
        console.log('Worker: Computation finished. Sending result.');
        self.postMessage({ result });
    } else {
        self.postMessage({ error: 'Unknown task' });
    }
};
