// Example functions for Promise-based patterns

export const createPromise = (value: any, delay: number, shouldReject = false) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldReject) {
                reject(value);
            } else {
                resolve(value);
            }
        }, delay);
    });
};

export async function runAll() {
    return Promise.all([
        createPromise('Success 1', 10),
        createPromise('Success 2', 20),
    ]);
}

export async function runAllSettled() {
    return Promise.allSettled([
        createPromise('Success', 10),
        createPromise('Failure', 20, true),
    ]);
}

export async function runRace() {
    return Promise.race([
        createPromise('Fast', 10),
        createPromise('Slow', 100),
    ]);
}

export async function runAny() {
    return Promise.any([
        createPromise('Failure', 10, true),
        createPromise('Success', 20),
    ]);
}
