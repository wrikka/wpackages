// This is the main script.
// It will spawn a worker to perform a task.

export function runWorker(): Promise<any> {
    return new Promise((resolve, reject) => {
        // Bun's Worker API is Web Worker compatible.
        // We use `import.meta.url` to resolve the path correctly.
        const worker = new Worker(new URL('./worker.ts', import.meta.url).href);

        worker.onmessage = (event) => {
            console.log('Main: Received message from worker:', event.data);
            resolve(event.data);
            worker.terminate(); // Clean up the worker
        };

        worker.onerror = (error) => {
            console.error('Main: Worker error:', error);
            reject(error);
            worker.terminate();
        };

        console.log('Main: Sending message to worker.');
        worker.postMessage({ task: 'heavy-computation', payload: 42 });
    });
}
