export function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const current = arr[j];
      const next = arr[j + 1];

      if (current !== undefined && next !== undefined && current > next) {
        [arr[j], arr[j + 1]] = [next, current];
      }
    }
  }
  return arr;
}

