const swap = <T>(array: T[], i: number, j: number): void => {
  const tempI = array[i];
  const tempJ = array[j];
  if (tempI !== undefined && tempJ !== undefined) {
    array[i] = tempJ;
    array[j] = tempI;
  }
};

const partition = <T>(array: T[], low: number, high: number): number => {
  const pivot = array[high];
  if (pivot === undefined) return high; // Should not happen in quickSort context
  let i = low - 1;

  for (let j = low; j < high; j++) {
    const current = array[j];
    if (current !== undefined && current !== null && pivot !== null && current < pivot) {
      i++;
      swap(array, i, j);
    }
  }

  swap(array, i + 1, high);
  return i + 1;
};

const quickSortRecursive = <T>(array: T[], low: number, high: number): void => {
  if (low < high) {
    const pi = partition(array, low, high);
    quickSortRecursive(array, low, pi - 1);
    quickSortRecursive(array, pi + 1, high);
  }
};

export const quickSort = <T>(array: T[]): T[] => {
  const newArray = [...array]; // Create a copy to avoid mutating the original array
  quickSortRecursive(newArray, 0, newArray.length - 1);
  return newArray;
};
